// src/context/auth-context.jsx
import { createContext, useState } from "react";

// 1. Create context
export const AuthContext = createContext();

// 2. Create provider
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // true if logged in
  const [user, setUser] = useState(null); // store user info like {id, email}
  const [token, setToken] = useState(null); // JWT token

  // 3. Login function
  const login = (data) => {
    setIsAuthenticated(true);
    setUser(data.user);
    setToken(data.token);

    // Save token in localStorage so axios can use it
    localStorage.setItem("token", data.token);
  };

 

  // 4. Logout function
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  // 5. Values we want to share with the whole app
  const value = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
  };

 return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
