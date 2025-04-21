import { ApolloProvider } from "@apollo/client";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useRoutes } from "react-router";
import { client } from "@/apollo/client";
import { AuthProvider } from "@/providers/AuthProvider";
import { AudioProvider } from "@/providers/AudioProvider";
import routes from "@/routes/_config";
import { fetchCsrfToken } from "@/utils/csrf";
import "@/styles/reset.css";
import "@/styles/global.css";

// Global CSRF initialization component
const CsrfInitializer = ({ children }: { children: React.ReactNode }) => {
	useEffect(() => {
		// Ensure CSRF token is fetched on app initialization
		fetchCsrfToken().catch((err) => {
			console.error("Failed to initialize CSRF token:", err);
		});
	}, []);

	return <>{children}</>;
};

// Create a component that renders the routes
const AppRoutes = () => useRoutes(routes);

// Get the root element
const rootElement = document.getElementById("root");

// Check if the element exists before trying to render
if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<ApolloProvider client={client}>
				<CsrfInitializer>
					<AuthProvider>
						<AudioProvider>
							<BrowserRouter>
								<AppRoutes />
							</BrowserRouter>
						</AudioProvider>
					</AuthProvider>
				</CsrfInitializer>
			</ApolloProvider>
		</StrictMode>,
	);
}
