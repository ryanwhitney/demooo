import { gql, useMutation } from "@apollo/client";
import { useEffect, useRef } from "react";

const REFRESH_TOKEN = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(token: $token) {
      token
      payload
      refreshExpiresIn
    }
  }
`;

function useTokenRefresh() {
	const [refreshToken, { loading }] = useMutation(REFRESH_TOKEN);
	const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

	// Setup refresh functionality
	useEffect(() => {
		const refresh = async () => {
			const currentToken = localStorage.getItem("authToken");
			if (!currentToken) return;

			try {
				const { data } = await refreshToken({
					variables: { token: currentToken },
				});

				localStorage.setItem("authToken", data.refreshToken.token);
				console.log("Token refreshed successfully");
			} catch (error) {
				console.error("Error refreshing token:", error);
				localStorage.removeItem("authToken");
				window.location.href = "/";
			}
		};

		// Run refresh immediately
		refresh();

		// Clear any existing interval and set a new one
		if (intervalIdRef.current) {
			clearInterval(intervalIdRef.current);
		}
		intervalIdRef.current = setInterval(refresh, 14 * 60 * 1000);
	}, [refreshToken]);

	return { loading };
}

export default useTokenRefresh; 