import ProtectedRoute from "@/components/protectedRoute/ProtectedRoute";
import MainLayout from "@/layouts/MainLayout";
// src/routes/config.tsx
import type { RouteObject } from "react-router";
import ArtistPage from "./Artist";
import Home from "./Home";
import ManageTracks from "./ManageTracks";
import ProfilePage from "./Profile";
import TrackPage from "./Track";
import UploadPage from "./Upload";

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
        path: "manage-tracks",
        element: (
          <ProtectedRoute>
            <ManageTracks />
          </ProtectedRoute>
        ),
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
