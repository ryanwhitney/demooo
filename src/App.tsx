import { ApolloProvider } from "@apollo/client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { client } from "./apollo/client";
import "./styles/reset.css";
import "./styles/global.css";
import { AuthProvider } from "./providers/AuthProvider";
import { AudioProvider } from "./providers/AudioProvider";
import ArtistPage from "./routes/ArtistPage";
import Home from "./routes/Home";
import TrackPage from "./routes/TrackPage";
import GlobalPlayer from "./features/globalPlayer/components/GlobalPlayer";
import { mockData } from "./apollo/mockData";
import { tokens } from "./styles/tokens";

// Get the root element
const rootElement = document.getElementById("root");

// Check if the element exists before trying to render
if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<ApolloProvider client={client}>
				<AuthProvider>
					<AudioProvider>
						<BrowserRouter>
							<Routes>
								<Route path="/" element={<Home />} />
								<Route path="/:artistName" element={<ArtistPage />} />
								<Route
									path="/:artistName/track/:titleSlug"
									element={<TrackPage />}
								/>
							</Routes>
							<GlobalPlayer />
						</BrowserRouter>
					</AudioProvider>
				</AuthProvider>
			</ApolloProvider>
		</StrictMode>,
	);
}
