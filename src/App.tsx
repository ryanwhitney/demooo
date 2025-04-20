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
import GlobalPlayer from "./features/audio/globalPlayer/GlobalPlayer";
import ProfilePage from "./routes/Profile";
import NavBar from "./features/nav/navBar/NavBar";
import UploadPage from "./routes/UploadPage";
import ProtectedRoute from "./routes/components/ProtectedRoute";
import SiteFooter from "./features/footer/SiteFooter";
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
							<NavBar />
							<Routes>
								<Route path="/" element={<Home />} />
								<Route path="/:artistName" element={<ArtistPage />} />
								<Route
									path="/:artistName/track/:titleSlug"
									element={<TrackPage />}
								/>

								<Route
									path="/profile"
									element={
										<ProtectedRoute>
											<ProfilePage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/upload"
									element={
										<ProtectedRoute>
											<UploadPage />
										</ProtectedRoute>
									}
								/>
							</Routes>
							<SiteFooter />
							<GlobalPlayer /> {/* Global audio player lives above all */}
						</BrowserRouter>
					</AudioProvider>
				</AuthProvider>
			</ApolloProvider>
		</StrictMode>,
	);
}
