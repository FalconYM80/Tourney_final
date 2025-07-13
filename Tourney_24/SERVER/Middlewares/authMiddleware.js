import jwt from "jsonwebtoken";

// Same JWT secret as used in frontend
const JWT_SECRET = "sports-hub-admin-secret-key";

// Verify JWT Token Middleware
export const verifyAdminToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    // Extract token from "Bearer TOKEN" format
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    // For demo purposes, manually verify the mock JWT structure
    // (since we created it client-side)
    const parts = token.split(".");
    if (parts.length !== 3) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    try {
      // Decode payload
      const payload = JSON.parse(atob(parts[1]));

      // Check if token is expired
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return res.status(401).json({
          success: false,
          message: "Token has expired",
        });
      }

      // Verify it's an admin token with correct data
      if (!payload.role || payload.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }

      // Verify against our static admin data
      if (payload.email !== "admin@sportshub.com") {
        return res.status(401).json({
          success: false,
          message: "Invalid admin token",
        });
      }

      // Add admin info to request object
      req.admin = {
        name: payload.name,
        email: payload.email,
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp,
      };

      next();
    } catch (decodeError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication",
      error: error.message,
    });
  }
};

// Optional: Log admin activity
export const logAdminActivity = (req, res, next) => {
  if (req.admin) {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const adminName = req.admin.name;

    // console.log(
    //   `[${timestamp}] Admin Activity: ${adminName} - ${method} ${url}`
    // );
  }
  next();
};

// Alternative: Using jsonwebtoken library (if you want proper JWT verification)
export const verifyAdminTokenWithJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    // Verify token using jsonwebtoken library
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            success: false,
            message: "Token has expired",
          });
        }
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      // Verify admin role and email
      if (decoded.role !== "admin" || decoded.email !== "admin@sportshub.com") {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }

      // Add admin info to request
      req.admin = decoded;
      next();
    });
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};

export default verifyAdminToken;
