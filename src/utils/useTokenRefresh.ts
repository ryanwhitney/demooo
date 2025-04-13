import { useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';

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

  useEffect(() => {
    const refresh = async () => {
      const currentToken = localStorage.getItem('authToken');
      
      if (!currentToken) return;
      
      try {
        const { data } = await refreshToken({
          variables: { token: currentToken }
        });
        
        localStorage.setItem('authToken', data.refreshToken.token);
        
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Error refreshing token:', error);
        // Handle failed refresh 
        localStorage.removeItem('authToken');
        window.location.href = '/';
      }
    };

    refresh();
    
    // Set up interval to refresh token before it expires
    // Assuming a typical JWT expiration of ~15 minutes, refresh every 14 minutes
    const intervalId = setInterval(refresh, 14 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [refreshToken]);

  return { loading };
}

export default useTokenRefresh;