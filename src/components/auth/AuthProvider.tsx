import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import useTokenRefresh from '../../utils/useTokenRefresh'

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  user: User | null;
  logout: () => void;
  refreshLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GET_ME = gql`
  query Whom {
    me {
      id
      username
      email
      firstName
      lastName
    }
  }
`;

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { loading: refreshLoading } = useTokenRefresh();

  // Only fetch user data if we have a token
  const { refetch } = useQuery(GET_ME, {
    skip: !isAuthenticated, // Use isAuthenticated instead of checking localStorage
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
      }
    },
    onError: () => {
      // If query fails, user might not be authenticated
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}