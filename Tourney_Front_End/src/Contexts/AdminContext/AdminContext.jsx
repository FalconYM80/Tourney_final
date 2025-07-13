import React from "react";
import { useState, createContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminContext = createContext();

// Simplified static admin data - only 3 fields
const STATIC_ADMIN_DATA = {
  name: "Admin User",
  email: "admin@sportshub.com",
  password: "admin123",
};

// JWT Secret for demo
const JWT_SECRET = "sports-hub-admin-secret-key";

const AdminContextProvider = (props) => {
  const [admin, setAdmin] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate JWT token
  const generateJWTToken = (adminData) => {
    try {
      const payload = {
        name: adminData.name,
        email: adminData.email,
        role: "admin",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      };

      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const payloadEncoded = btoa(JSON.stringify(payload));
      const signature = btoa(`${header}.${payloadEncoded}.${JWT_SECRET}`);

      return `${header}.${payloadEncoded}.${signature}`;
    } catch (error) {
      console.error("Token generation error:", error);
      return null;
    }
  };

  // Verify JWT token
  const verifyJWTToken = (token) => {
    try {
      if (!token) return null;

      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));

      // Check if token is expired
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch (error) {
      console.error("Token verification error:", error);
      return null;
    }
  };

  // Login function
  const loginAdmin = (email, password) => {
    try {
      // Check against static data
      if (
        email === STATIC_ADMIN_DATA.email &&
        password === STATIC_ADMIN_DATA.password
      ) {
        // Generate JWT token
        const jwtToken = generateJWTToken(STATIC_ADMIN_DATA);

        if (!jwtToken) {
          return {
            success: false,
            message: "Failed to generate authentication token",
          };
        }

        // Create admin session data
        const adminData = {
          name: STATIC_ADMIN_DATA.name,
          email: STATIC_ADMIN_DATA.email,
          role: "admin",
          loginTime: new Date().toISOString(),
        };

        // Store in state
        setAdmin(adminData);
        setToken(jwtToken);
        setIsLoggedIn(true);

        // Store in sessionStorage
        sessionStorage.setItem("adminData", JSON.stringify(adminData));
        sessionStorage.setItem("adminToken", jwtToken);

        return {
          success: true,
          message: "Login successful",
          token: jwtToken,
          admin: adminData,
        };
      } else {
        return { success: false, message: "Invalid email or password" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed. Please try again." };
    }
  };

  // Logout function
  const logoutAdmin = () => {
    try {
      setAdmin(null);
      setToken(null);
      setIsLoggedIn(false);

      // Clear storage
      sessionStorage.removeItem("adminData");
      sessionStorage.removeItem("adminToken");

      toast.info("Logged out successfully");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false };
    }
  };

  // Check if admin is already logged in
  const checkAdminAuth = () => {
    try {
      const storedToken = sessionStorage.getItem("adminToken");
      const storedAdminData = sessionStorage.getItem("adminData");

      if (storedToken && storedAdminData) {
        // Verify token
        const tokenPayload = verifyJWTToken(storedToken);

        if (tokenPayload) {
          const adminData = JSON.parse(storedAdminData);
          setAdmin(adminData);
          setToken(storedToken);
          setIsLoggedIn(true);
          return true;
        } else {
          // Token expired
          sessionStorage.removeItem("adminData");
          sessionStorage.removeItem("adminToken");
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error("Auth check error:", error);
      return false;
    }
  };

  // Get token claims
  const getTokenClaims = () => {
    if (!token) return null;
    return verifyJWTToken(token);
  };

  // Check if token is about to expire (within 1 hour)
  const isTokenExpiringSoon = () => {
    const claims = getTokenClaims();
    if (!claims) return true;

    const expirationTime = claims.exp * 1000;
    const currentTime = Date.now();
    const oneHour = 60 * 60 * 1000;

    return expirationTime - currentTime < oneHour;
  };

  // Check auth on component mount
  useEffect(() => {
    checkAdminAuth();
  }, []);

  const value = {
    // State
    admin,
    isLoggedIn,
    token,
    loading,

    // Functions
    loginAdmin,
    logoutAdmin,
    checkAdminAuth,
    getTokenClaims,
    isTokenExpiringSoon,

    // Admin data for reference
    staticAdminData: STATIC_ADMIN_DATA,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export { AdminContext };
export default AdminContextProvider;