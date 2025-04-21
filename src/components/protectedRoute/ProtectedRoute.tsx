import { Navigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return null;
	}

	if (!isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
}

export default ProtectedRoute;
