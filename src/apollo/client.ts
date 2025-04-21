import { ApolloClient, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Enable debugging in development only
const DEBUG = import.meta.env.DEV;

// Immediately fetch CSRF token when this module loads
async function preFetchCsrfToken() {
  try {
    if (DEBUG) console.log("Apollo client: Pre-fetching CSRF token");
    
    const response = await fetch(`${API_BASE_URL}/api/csrf/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      console.error("Failed to pre-fetch CSRF token:", response.statusText);
    }
    return response.ok;
  } catch (error) {
    console.error("Error pre-fetching CSRF token:", error);
    return false;
  }
}

// Start the pre-fetch process
const csrfPromise = preFetchCsrfToken();

// Create the upload link with credentials
const uploadLink = createUploadLink({
  uri: `${API_BASE_URL}/graphql/`,
  credentials: 'include',
  fetchOptions: {
    credentials: 'include',
  },
});

// Get the CSRF token from cookies
const getCsrfToken = (): string => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1] || '';
  
  return cookieValue;
}

// Add CSRF token to all headers
const authLink = setContext(async (_operation, { headers }) => {
  // Wait for the CSRF token to be pre-fetched
  await csrfPromise;
  
  const csrfToken = getCsrfToken();
    
  return {
    headers: {
      ...headers,
      'X-CSRFToken': csrfToken,
    },
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
