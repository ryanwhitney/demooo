// src/routes/config.tsx
import type { RouteObject } from "react-router";
import Home from "./Home";
import ArtistPage from "./Artist";
import TrackPage from "./Track";
import ProfilePage from "./Profile";
import UploadPage from "./Upload";
import ProtectedRoute from "@/components/protectedRoute/ProtectedRoute";
import MainLayout from "@/layouts/MainLayout";

export const routes: RouteObject[] = [
	{
		path: "/",
		element: <MainLayout />,
		children: [
			{
				index: true,
				element: <Home />,
			},
			{
				path: ":artistName",
				element: <ArtistPage />,
			},
			{
				path: ":artistName/track/:titleSlug",
				element: <TrackPage />,
			},
			{
				path: "profile",
				element: (
					<ProtectedRoute>
						<ProfilePage />
					</ProtectedRoute>
				),
			},
			{
				path: "upload",
				element: (
					<ProtectedRoute>
						<UploadPage />
					</ProtectedRoute>
				),
			},
		],
	},
];

export default routes;
