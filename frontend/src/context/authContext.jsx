import { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const verify = async () => {
      const stored = localStorage.getItem("token");
      if (!stored) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await client.get("/auth/me");
        setUser(data);
        setToken("true");
      } catch {
        // Cookie expired or invalid
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  const login = async (email, password) => {
    const { data } = await client.post("/auth/login", { email, password });
    localStorage.setItem("token", "true");
    setToken("true");
    // Fetch full user profile after login
    try {
      const { data: me } = await client.get("/auth/me");
      setUser(me);
    } catch {
      setUser({ email });
    }
    return data;
  };

  const register = async (email, password, name) => {
    const { data } = await client.post("/auth/register", { email, password, name });
    localStorage.setItem("token", "true");
    setToken("true");
    try {
      const { data: me } = await client.get("/auth/me");
      setUser(me);
    } catch {
      setUser({ email, name });
    }
    return data;
  };

  const logout = async () => {
    try {
      await client.post("/auth/logout");
    } catch {}
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // context/AuthContext.jsx

return (
  <AuthContext.Provider value={{ token, user, login, register, logout, loading }}>
    {/* If loading is true, we show a splash screen. 
       This prevents the Router from seeing "no user" and redirecting to login.
    */}
    {!loading ? (
      children
    ) : (
      <div style={{ 
        height: '100vh', 
        background: '#050505', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        {/* Simple modern spinner */}
        <div className="loading-spinner" /> 
      </div>
    )}
    
    <style>{`
      .loading-spinner {
        width: 30px;
        height: 30px;
        border: 3px solid #1a1a1a;
        border-top: 3px solid #F59E0B;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </AuthContext.Provider>
);
}

export const useAuth = () => useContext(AuthContext);