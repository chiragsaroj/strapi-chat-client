import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from './components/loader';

// Define the context data shape
interface AuthContextType {
  logout: () => void;
  loading: boolean;
}

// Create the AuthContext with default values
export const AuthContext = createContext<AuthContextType>({
  logout: () => {},
  loading: false,
});

// Props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const token = getToken();

  // Retrieve token from local storage
  function getToken (): string | null {
    return localStorage.getItem('jwtToken');
  };

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('jwtToken');
    navigate('/sign-in');
  };

  useEffect(() => {
    setLoading(true);
    if (token) {
      console.log(token)
    }else{
      navigate('/sign-in')
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ logout, loading }}>
      {loading && <Loader />}
      {children}
    </AuthContext.Provider>
  );
};
