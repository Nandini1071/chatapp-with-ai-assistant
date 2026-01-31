import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const userContext = createContext();

const UserContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

const decodeToken = (token) => {
  if (!token) {
    setUser(null);
    return;
  }

  try {
    const decoded = jwtDecode(token);

    // ✅ CHECK TOKEN EXPIRY HERE
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      setUser(null);
      return;
    }

    // ✅ TOKEN IS VALID
    setUser(decoded);
  } catch (err) {
    console.error("JWT decode error:", err);
    localStorage.removeItem("token");
    setUser(null);
  }
};

  useEffect(() => {
    // Check token on component mount
    const token = localStorage.getItem("token");
    decodeToken(token);
    setLoading(false);

    // Listen for storage changes (when token is set in another tab/window)
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      decodeToken(newToken);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <userContext.Provider value={{ user, setUser, loading }}>
      {children}
    </userContext.Provider>
  );
};

export default UserContext;
