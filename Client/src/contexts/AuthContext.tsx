import { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  error: null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user is already logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('http://localhost:3000/api/auth/login', {
        username,
        password,
      }, {
        withCredentials: true, // Make sure the cookies are sent with the request
      });

      if (response.data.csrfToken) {
        const loggedInUser = response.data.user;

        // Set the user data in the context and localStorage
        setUser(loggedInUser);
        localStorage.setItem('user', JSON.stringify(loggedInUser));

        // You can store the CSRF token and API key in sessionStorage if needed
        localStorage.setItem('csrfToken', response.data.csrfToken);
        localStorage.setItem('apiKey', JSON.stringify(response.data.apiKey));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('http://localhost:3000/api/auth/register', {
        username,
        email,
        password,
      });

      if (response.data.accessToken) {
        const newUser = response.data.user;
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Send request to the backend API to log out
      await axios.post('http://localhost:3000/api/auth/logout');

      // Clear session and local storage
      localStorage.removeItem('user');
      localStorage.removeItem('csrfToken');
      localStorage.removeItem('apiKey');

      // Set the user state to null
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      // Mock delay, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        resetPassword,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
