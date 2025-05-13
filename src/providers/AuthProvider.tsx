import { LOGOUT } from "@/apollo/mutations/userMutations";
import type { User } from "@/types/user";
import { getCsrfToken } from "@/utils/csrf";
import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_ME } from "../apollo/queries/userQueries";
import type { AuthContextType, AuthProviderProps } from "../types/auth";
import { AuthContext } from "./AuthContext";

const DEBUG = import.meta.env.DEV;

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Start with null to indicate unknown
  const [user, setUser] = useState<User | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [csrfReady, setCsrfReady] = useState(false);

  // Check for CSRF token - don't fetch, as that's done at Apollo client level
  useEffect(() => {
    // Immediately check if token already exists (from Apollo client init)
    const hasToken = !!getCsrfToken();
    if (hasToken) {
      if (DEBUG) console.log("AuthProvider: CSRF token already exists");
      setCsrfReady(true);
    } else {
      // Poll briefly for token to appear
      const checkInterval = setInterval(() => {
        if (getCsrfToken()) {
          if (DEBUG) console.log("AuthProvider: CSRF token detected");
          setCsrfReady(true);
          clearInterval(checkInterval);
        }
      }, 100);

      // Set a timeout to proceed anyway after a short delay
      setTimeout(() => {
        if (!csrfReady) {
          if (DEBUG)
            console.log(
              "AuthProvider: Proceeding without confirmed CSRF token",
            );
          setCsrfReady(true);
          clearInterval(checkInterval);
        }
      }, 500);

      return () => clearInterval(checkInterval);
    }
  }, [csrfReady]);

  // Get current user data - this will automatically include the session cookie
  const { loading } = useQuery(GET_ME, {
    fetchPolicy: "network-only", // Always check with server
    skip: !csrfReady, // Skip the query until CSRF is ready
    onCompleted: (data) => {
      if (DEBUG) console.log("AuthProvider: GET_ME completed", data);
      if (data?.me) {
        setUser(data.me);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setInitialLoadComplete(true);
    },
    onError: (error) => {
      console.error("AuthProvider: GET_ME query error:", error);

      // Check if this is a CSRF error or server unreachable
      if (
        error.message.includes("CSRF") ||
        error.message.includes("Network error")
      ) {
        // Don't immediately log out on CSRF errors - could be fixable
        console.warn(
          "AuthProvider: Authentication error may be temporary, retrying...",
        );
        // Try again after a brief delay
        setTimeout(() => {
          // Force Apollo to refetch
          window.location.reload();
        }, 500);
      } else {
        // For other errors, assume not authenticated
        setIsAuthenticated(false);
        setUser(null);
        setInitialLoadComplete(true);
      }
    },
  });

  const [logoutMutation] = useMutation(LOGOUT);

  const logout = async () => {
    try {
      await logoutMutation();
      // Clear auth state
      setIsAuthenticated(false);
      setUser(null);
      // Reload to reset Apollo cache and application state
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout failed on server, reset local state
      setIsAuthenticated(false);
      setUser(null);
      window.location.reload();
    }
  };

  // Context value with proper typing - treat null as loading state
  const contextValue: AuthContextType = {
    isAuthenticated: isAuthenticated === null ? false : isAuthenticated,
    setIsAuthenticated,
    user,
    logout,
    loading: loading || isAuthenticated === null || !initialLoadComplete,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
