import JWT from "jsonwebtoken";
import Organizer from "../Models/Organizer/OrganizerModel.js";

import "dotenv/config";

// Token for Player/User

const setUserTokenAndCookie = async (user, res) => {
  const payLoad = {
    userId: user._id,
  };

  const token = JWT.sign(payLoad, process.env.JWT_Secret_Key, {
    expiresIn: "7d",
  });

  res.cookie("JWT_User", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const userAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.JWT_User;

    if (!token) {
      return res.json({
        success: false,
        message: `Your Session Has Been Expired, Please Try Login Again`,
      });
    }

    const user = JWT.verify(token, process.env.JWT_Secret_Key);
    // console.log(user);
    /**
         * {
            userId: '6818d1631ba2d662e0c19406',
            iat: 1746466226,
            exp: 1747071026
           }
         */
    if (user.userId) {
      req.user = user.userId;
    } else {
      return res.json({
        success: false,
        message: `User is Not Authorized Login Again Please`,
      });
    }

    next();
  } catch (error) {
    return res.json({
      success: false,
      message: `Error In User Authentication Middleware ${error}`,
    });
  }
};

// Tokens For Admin

const generateTokenForAdmin = async (res) => {
  const payLoad = {
    mail: process.env.ADMIN_EMAIL,
  };

  const token = JWT.sign(payLoad, process.env.JWT_Secret_Key, {
    expiresIn: "1d",
  });

  res.cookie("JWT_Admin", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
};

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.JWT_Admin;

    if (!token) {
      return res.json({
        success: false,
        message: `Admin Session Has Been Expired, Please Try Login Again`,
      });
    }

    const admin = JWT.verify(token, process.env.JWT_Secret_Key);

    if (admin.mail) {
      req.adminMail = admin.mail;
    } else {
      return res.json({
        success: false,
        message: `Admin is Not Authorized Login Again Please`,
      });
    }

    next();
  } catch (error) {
    return res.json({
      success: false,
      message: `Error In Admin Authentication Middleware ${error}`,
    });
  }
};

// Token For Organizer

const setOrganizerTokenAndCookies = async (organizer, res) => {
  const payLoad = {
    organizerId: organizer._id,
  };

  const token = JWT.sign(payLoad, process.env.JWT_Secret_Key, {
    expiresIn: "1d",
  });

  res.cookie("JWT_Organizer", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
};

const organizerAuthMidlleware = async (req, res, next) => {
  try {
    const token = req.cookies.JWT_Organizer;

    if (!token) {
      return res.json({
        success: false,
        message: `Organizer Session Has Been Expired, Please Try Login Again`,
      });
    }

    const decoded = JWT.verify(token, process.env.JWT_Secret_Key);

    // decoded will have organizerId => the user who logged in
    const loggedInUserId = decoded.organizerId;
    if (!loggedInUserId) {
      return res.json({
        success: false,
        message: `Organizer is Not Authorized Login Again Please`,
      });
    }

    // Fetch user to get current organization context every request so that switching org reflects immediately
    const loggedInUser = await Organizer.findById(loggedInUserId).select(
      "currentOrganizationContext"
    );
    if (!loggedInUser) {
      return res.json({
        success: false,
        message: `Organizer not found. Please login again.`,
      });
    }

    // If user has switched to another organization, use that in downstream controllers; otherwise default to their own id
    const activeOrganizationId = loggedInUser.currentOrganizationContext
      ? loggedInUser.currentOrganizationContext.toString()
      : loggedInUserId.toString();

    // Expose values on request for convenience
    req.organizerUser = loggedInUserId; // always the logged-in account id
    req.activeOrganization = activeOrganizationId; // currently selected org id

    // For backward-compatibility, many legacy controllers read req.organizer to get organization id.
    // Hence, we point it to the active organization, NOT the user id.
    req.organizer = activeOrganizationId;

    return next();
  } catch (error) {
    console.log("Error in organizerAuthMidlleware", error);
    return res.json({
      success: false,
      message: `Error In Organizer Authentication Middleware ${error}`,
    });
  }
};

export {
  setUserTokenAndCookie,
  userAuthMiddleware,
  generateTokenForAdmin,
  adminAuthMiddleware,
  setOrganizerTokenAndCookies,
  organizerAuthMidlleware,
};
