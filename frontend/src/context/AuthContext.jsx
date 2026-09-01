import { createContext, useContext, useState, useEffect } from 'react';
import { signupUser, loginUser, getMe } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rescueflow_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('rescueflow_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getMe()
        .then((res) => {
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('rescueflow_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          // Token expired or invalid
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res.data && res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('rescueflow_token', res.data.token);
      localStorage.setItem('rescueflow_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const signup = async (data) => {
    const res = await signupUser(data);
    if (res.data && res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('rescueflow_token', res.data.token);
      localStorage.setItem('rescueflow_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('rescueflow_token');
    localStorage.removeItem('rescueflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
