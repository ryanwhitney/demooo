import { useCallback, useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const DEBUG = import.meta.env.DEV;

// Keep a memory reference to the CSRF token that persists across the session
// This helps in private browsing where cookies might be restricted
let inMemoryCsrfToken = "";

// Track if we're already fetching to prevent duplicate requests
let isFetchingCsrf = false;
let csrfInitialized = false;

/**
 * Get the CSRF token from cookies or memory
 */
export const getCsrfToken = (): string => {
  // First try to get it from cookies
  const cookieValue =
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1] || "";

  // If found in cookies, update our in-memory reference too
  if (cookieValue) {
    // Only log on value change to reduce noise
    if (inMemoryCsrfToken !== cookieValue && DEBUG) {
      console.log("CSRF token found in cookies");
    }
    inMemoryCsrfToken = cookieValue;
    return cookieValue;
  }

  // If not in cookies but we have it in memory, use that
  if (inMemoryCsrfToken) {
    if (DEBUG && !csrfInitialized) {
      console.log("Using in-memory CSRF token (cookies unavailable)");
      csrfInitialized = true;
    }
    return inMemoryCsrfToken;
  }

  if (DEBUG && !csrfInitialized) {
    console.log("No CSRF token available");
    csrfInitialized = true;
  }
  return "";
};

/**
 * Extract CSRF token from response headers or HTML
 */
export const extractCsrfTokenFromResponse = async (
  response: Response,
): Promise<string> => {
  // First check for CSRF token in headers
  const csrfHeader = response.headers.get("X-CSRFToken");
  if (csrfHeader) {
    if (DEBUG) console.log("Got CSRF token from response header");
    inMemoryCsrfToken = csrfHeader;
    return csrfHeader;
  }

  // Then try to parse it from HTML content
  try {
    const text = await response.text();
    const match = text.match(/name="csrfmiddlewaretoken" value="([^"]+)"/);
    if (match?.[1]) {
      if (DEBUG) console.log("Got CSRF token from HTML response");
      inMemoryCsrfToken = match[1];
      return match[1];
    }
  } catch (error) {
    console.error("Error parsing response for CSRF token:", error);
  }

  return "";
};

/**
 * Fetch CSRF token from the server
 */
export const fetchCsrfToken = async (): Promise<boolean> => {
  try {
    // Check if we already have a token or if a fetch is in progress
    if (isFetchingCsrf) {
      return true; // Another fetch is in progress, assume it will succeed
    }

    const existingToken = getCsrfToken();
    if (existingToken) {
      if (DEBUG) console.log("Already have CSRF token");
      return true;
    }

    if (DEBUG) console.log("Fetching CSRF token...");
    isFetchingCsrf = true;

    const response = await fetch(`${API_BASE_URL}/api/csrf/`, {
      method: "GET",
      credentials: "include",
    });

    isFetchingCsrf = false;

    if (response.ok) {
      if (DEBUG) console.log("CSRF token fetch response OK");

      // Check cookies for the token
      let token = getCsrfToken();

      // If not in cookies, try to extract it from the response
      if (!token) {
        token = await extractCsrfTokenFromResponse(response);
      }

      // If we got a token by any means, we're good
      if (token) {
        inMemoryCsrfToken = token;
        return true;
      }

      // Wait a moment for the cookie to be set and try again
      await new Promise((resolve) => setTimeout(resolve, 100));
      token = getCsrfToken();

      if (token) {
        return true;
      }

      console.error(
        "CSRF token not available after fetch - private browsing may block cookies",
      );
      return false;
    }

    console.error("Failed to fetch CSRF token:", response.statusText);
    return false;
  } catch (error) {
    isFetchingCsrf = false;
    console.error("Error fetching CSRF token:", error);
    return false;
  }
};

/**
 * Set the CSRF token manually in request headers
 */
export const setCSRFHeader = (
  headers: Record<string, string>,
): Record<string, string> => {
  const token = getCsrfToken();

  if (token) {
    return {
      ...headers,
      "X-CSRFToken": token,
    };
  }

  if (DEBUG) console.warn("No CSRF token available for request headers");
  return headers;
};

/**
 * Hook for using CSRF token in components
 */
export const useCsrf = () => {
  const [csrfFetched, setCsrfFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the getCsrfToken function
  const getToken = useCallback(getCsrfToken, []);

  // Fetch CSRF token on component mount
  useEffect(() => {
    let mounted = true;

    const setupCsrf = async () => {
      // If we already have a token, don't fetch again
      if (getCsrfToken()) {
        if (mounted) setCsrfFetched(true);
        return;
      }

      try {
        const success = await fetchCsrfToken();
        if (!mounted) return;

        setCsrfFetched(success);

        if (!success) {
          // In private browsing, this is often just a warning, not a blocker
          console.warn("CSRF warning: This may be a private browsing session");

          // Even without cookies, we may have the token in memory
          if (inMemoryCsrfToken) {
            setCsrfFetched(true);
          } else {
            setError(
              "Browser might be blocking cookies. Still trying to work with the app.",
            );
          }
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Error in CSRF setup:", err);
        setError(
          "Failed to set up secure connection. Please try refreshing the page.",
        );
      }
    };

    setupCsrf();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    csrfFetched: csrfFetched || !!inMemoryCsrfToken,
    error,
    getToken,
  };
};
