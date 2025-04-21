import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { GET_ME } from "../apollo/queries/userQueries";
import type { AuthContextType, AuthProviderProps } from "../types/auth";
import { AuthContext } from "./AuthContext";
import { LOGOUT } from "@/apollo/mutations/userMutations";
import type { User } from "@/types/user";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export function AuthProvider({ children }: AuthProviderProps) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [initialLoadComplete, setInitialLoadComplete] = useState(false);
	const [csrfFetched, setCsrfFetched] = useState(false);

	// Fetch CSRF token before any authentication operations
	useEffect(() => {
		const fetchCsrfToken = async () => {
			try {
				const response = await fetch(`${API_BASE_URL}/api/csrf/`, {
					method: "GET",
					credentials: "include",
				});

				if (response.ok) {
					setCsrfFetched(true);
				} else {
					console.error("Failed to fetch CSRF token:", response.statusText);
				}
			} catch (error) {
				console.error("Error in CSRF flow:", error);
			}
		};

		fetchCsrfToken();
	}, []);

	// Get current user data - this will automatically include the session cookie
	const { loading } = useQuery(GET_ME, {
		fetchPolicy: "network-only", // Always check with server
		skip: !csrfFetched, // Skip the query until CSRF token is fetched
		onCompleted: (data) => {
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
			console.error("GET_ME query error:", error);
			setIsAuthenticated(false);
			setUser(null);
			setInitialLoadComplete(true);
		},
	});

	const [logoutMutation] = useMutation(LOGOUT);

	const logout = async () => {
		try {
			const result = await logoutMutation();
			setIsAuthenticated(false);
			setUser(null);
			window.location.reload();
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	// Context value with proper typing
	const contextValue: AuthContextType = {
		isAuthenticated,
		setIsAuthenticated,
		user,
		logout,
		loading: loading && !initialLoadComplete,
	};

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
}
