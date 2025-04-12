import { createContext, useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import useTokenRefresh from '../utils/useTokenRefresh';
import { User, AuthContextType, AuthProviderProps } from '../types/auth';
import { GET_ME } from '../apollo/queries/userQueries'

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { loading: refreshLoading } = useTokenRefresh();

  // Only fetch user data if we have a token
  const { refetch } = useQuery(GET_ME, {
    skip: !isAuthenticated,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
      }
    },
    onError: () => {
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setUser(null);
    }
  });

  //  Refetch user data when isAuthenticated changes to true
  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, refetch]);

  // Check if user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/';
  };

  // Context value with proper typing
  const contextValue: AuthContextType = {
    isAuthenticated,
    setIsAuthenticated, // Expose the setter
    user,
    logout,
    refreshLoading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}