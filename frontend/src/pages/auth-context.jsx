import { createContext, useState, useEffect, useCallback, useContext } from "react";
import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import api from "../api/axios";

export const AuthContext = createContext();

export const useAuth = () => {
  const authContext = useContext(AuthContext)
  if(!authContext) {
    throw new Error("useAuth can only be used in AuthProvider")
  }

  return authContext;
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); 

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const user = localStorage.getItem("user")
  
      if (savedToken) {
        setIsAuthenticated(true);
        setToken(savedToken);
        setUser(JSON.parse(user))
      }
    } catch(error) {
      // If an error ever occured during token/user retrieval/parsing then log the user out
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }

    setAuthLoading(false); 
  }, []);

  /* ------------------ Logout Mutation ------------------ */
  const { trigger: logoutTrigger } = useSWRMutation(
    "/logout",
    async (url) => {
      const res = await api.post(url);
      return res.data;
    }
  );

  const login = useCallback((data) => {
    setIsAuthenticated(true);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user))
  }, []);

  const logout = useCallback(async () => {
    const currentToken = token || localStorage.getItem("token");
    
    // Clear local state first for immediate UI update
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    
    // Clear all SWR cache on logout
    mutate(() => true, undefined, { revalidate: false });
    
    // Call logout endpoint to revoke token on server (fire and forget)
    if (currentToken) {
      logoutTrigger().catch((err) => {
        // Silently fail - user is already logged out locally
        console.error("Logout API error (ignored):", err);
      });
    }
  }, [token, logoutTrigger]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, token, authLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
