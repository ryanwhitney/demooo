import { ApolloClient, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { getCsrfToken, fetchCsrfToken, setCSRFHeader } from "@/utils/csrf";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Enable debugging in development only
const DEBUG = import.meta.env.DEV;

// Flag to track if we're already fetching the token
let fetchingCsrfPromise: Promise<boolean> | null = null;

// Ensure CSRF token is available before any request
const ensureCsrfToken = async (): Promise<boolean> => {
  // If we're already fetching, return the existing promise
  if (fetchingCsrfPromise) {
    return fetchingCsrfPromise;
  }
  
  // Check if we already have a token
  if (getCsrfToken()) {
    if (DEBUG) console.log("Apollo client: CSRF token already available");
    return true;
  }
  
  // Start fetching a new token
  if (DEBUG) console.log("Apollo client: Fetching CSRF token");
  fetchingCsrfPromise = fetchCsrfToken();
  
  try {
    // Wait for the fetch to complete
    const result = await fetchingCsrfPromise;
    // Reset the promise
    fetchingCsrfPromise = null;
    return result;
  } catch (error) {
    // Reset the promise on error
    fetchingCsrfPromise = null;
    return false;
  }
};

// Immediately start fetching CSRF token when module loads
const initPromise = ensureCsrfToken();

// Create the upload link with credentials
const uploadLink = createUploadLink({
  uri: `${API_BASE_URL}/graphql/`,
  credentials: 'include',
  fetchOptions: {
    credentials: 'include',
  },
});

// Add CSRF token to all headers
const authLink = setContext(async (_operation, { headers }) => {
  // Wait for the initial token fetch
  await initPromise;
  
  // Get the token - if not found, try fetching it again
  let csrfToken = getCsrfToken();
  
  if (!csrfToken) {
    if (DEBUG) console.log("No CSRF token found before request, fetching again...");
    await ensureCsrfToken();
    csrfToken = getCsrfToken();
  }
  
  if (DEBUG) {
    if (csrfToken) {
      console.log("Using CSRF token for request");
    } else {
      console.warn("No CSRF token available for request - proceeding anyway");
    }
  }
  
  // Use our utility function to add the CSRF header
  return {
    headers: setCSRFHeader({
      ...headers
    }),
  };
});

export const client = new ApolloClient({
  link: authLink.concat(uploadLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
