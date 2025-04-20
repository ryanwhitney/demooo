import { ApolloProvider } from "@apollo/client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useRoutes } from "react-router";
import { client } from "@/apollo/client";
import { AuthProvider } from "@/providers/AuthProvider";
import { AudioProvider } from "@/providers/AudioProvider";
import routes from "@/routes/_config";
import "@/styles/reset.css";
import "@/styles/global.css";

// Get the root element
const rootElement = document.getElementById("root");

// Create a component that renders the routes
const AppRoutes = () => useRoutes(routes);

// Check if the element exists before trying to render
if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<ApolloProvider client={client}>
				<AuthProvider>
					<AudioProvider>
						<BrowserRouter>
							<AppRoutes />
						</BrowserRouter>
					</AudioProvider>
				</AuthProvider>
			</ApolloProvider>
		</StrictMode>,
	);
}
