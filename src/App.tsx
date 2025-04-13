import { ApolloProvider } from "@apollo/client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { client } from "./apollo/client";
import "./styles/reset.css";
import "./styles/global.css";
import { AuthProvider } from "./providers/AuthProvider";
import ArtistPage from "./routes/ArtistPage";
import Home from "./routes/Home";
import TrackPage from "./routes/TrackPage";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ApolloProvider client={client}>
			<AuthProvider>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/:artistName" element={<ArtistPage />} />
						<Route path="/:artistName/track" element={<TrackPage />} />
					</Routes>
				</BrowserRouter>
			</AuthProvider>
		</ApolloProvider>
	</StrictMode>,
);
