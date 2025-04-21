import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_ME } from "../apollo/queries/userQueries";
import type { AuthContextType, AuthProviderProps } from "../types/auth";
import { AuthContext } from "./AuthContext";
import { LOGOUT } from "@/apollo/mutations/userMutations";
import type { User } from "@/types/user";
import { fetchCsrfToken, getCsrfToken } from "@/utils/csrf";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const DEBUG = import.meta.env.DEV;

export function AuthProvider({ children }: AuthProviderProps) {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Start with null to indicate unknown
	const [user, setUser] = useState<User | null>(null);
	const [initialLoadComplete, setInitialLoadComplete] = useState(false);
	const [csrfFetched, setCsrfFetched] = useState(false);

	// Fetch CSRF token before any authentication operations
	useEffect(() => {
		const setupCsrf = async () => {
			try {
				if (DEBUG) console.log("AuthProvider: Setting up CSRF token");
				const success = await fetchCsrfToken();
				if (success) {
					if (DEBUG)
						console.log("AuthProvider: CSRF token fetched successfully");
					setCsrfFetched(true);
				} else {
					// Try one more time after a short delay
					await new Promise((resolve) => setTimeout(resolve, 300));
					const retrySuccess = await fetchCsrfToken();
					if (retrySuccess || getCsrfToken()) {
						if (DEBUG)
							console.log("AuthProvider: CSRF token available after retry");
						setCsrfFetched(true);
					} else {
						console.error(
							"AuthProvider: Failed to fetch CSRF token after retry",
						);
						// Still set as fetched to proceed with auth check - we might have the token in memory
						setCsrfFetched(true);
					}
				}
			} catch (error) {
				console.error("AuthProvider: Error in CSRF flow:", error);
				// Still set csrfFetched to true to allow the auth query to proceed
				setCsrfFetched(true);
			}
		};

		setupCsrf();
	}, []);

	// Get current user data - this will automatically include the session cookie
	const { loading } = useQuery(GET_ME, {
		fetchPolicy: "network-only", // Always check with server
		skip: !csrfFetched, // Skip the query until CSRF token is fetched
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
