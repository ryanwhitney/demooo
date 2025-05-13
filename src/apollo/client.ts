import { fetchCsrfToken, getCsrfToken, setCSRFHeader } from "@/utils/csrf";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Enable debugging in development only
const DEBUG = import.meta.env.DEV;

// Flag to track if initial setup is done
let setupComplete = false;

// Ensure CSRF token is available before any request - but only once
const ensureCsrfToken = async (): Promise<boolean> => {
  // Skip if we already completed setup or already have a token
  if (setupComplete || getCsrfToken()) {
    if (DEBUG && !setupComplete) {
      console.log("Apollo client: CSRF token already available");
      setupComplete = true;
    }
    return true;
  }

  // Start fetching a new token
  if (DEBUG) console.log("Apollo client: Fetching CSRF token");
  const result = await fetchCsrfToken();
  setupComplete = true;
  return result;
};

// Create the upload link with credentials
const uploadLink = createUploadLink({
  uri: `${API_BASE_URL}/graphql/`,
  credentials: "include",
  fetchOptions: {
    credentials: "include",
  },
});

// Immediately start fetching CSRF token when module loads
ensureCsrfToken();

// Add CSRF token to all headers
const authLink = setContext(async (_operation, { headers }) => {
  // Make sure we have initialized CSRF
  await ensureCsrfToken();

  // Get the token
  const csrfToken = getCsrfToken();

  if (DEBUG && !csrfToken) {
    // Only log actual problems to reduce console noise
    console.warn("No CSRF token available for request - proceeding anyway");
  }

  // Use our utility function to add the CSRF header
  return {
    headers: setCSRFHeader({
      ...headers,
    }),
  };
});

export const client = new ApolloClient({
  link: authLink.concat(uploadLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});
