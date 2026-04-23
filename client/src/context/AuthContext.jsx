import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'sc_token';
const USER_KEY = 'sc_user';

const parseStoredUser = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(() => parseStoredUser(localStorage.getItem(USER_KEY)));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = parseStoredUser(localStorage.getItem(USER_KEY));

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken('');
    setUser(null);
  };

  const value = {
    token,
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
