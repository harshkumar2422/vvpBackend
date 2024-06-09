import { User } from "../models/UserModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next(new ErrorHandler("User not logged in", 400));
  
  const token = authHeader.split(" ")[1];
  
  if (!token) return next(new ErrorHandler("User not logged in", 400));
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);
    if (!req.user) return next(new ErrorHandler("User not found", 404));
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return next(new ErrorHandler("Invalid token", 400));
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return next(new ErrorHandler("User role not found", 400));
  }
  
  
  if (req.user.role !== "admin") {
    return next(
      new ErrorHandler(
        `${req.user.role} is not allowed to access this resource`,
        403
      )
    );
  }
  next();
};
