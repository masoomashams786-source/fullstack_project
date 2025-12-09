import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // ✅ NEW

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setIsAuthenticated(true);
      setToken(savedToken);
    }

    setAuthLoading(false); // ✅ DONE checking
  }, []);

  const login = (data) => {
    setIsAuthenticated(true);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("token", data.token);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, token, authLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
