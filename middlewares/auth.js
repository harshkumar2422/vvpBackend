import { User } from "../models/UserModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  console.log("Token:", token);
  if (!token) return next(new ErrorHandler("user not logged in", 400));
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded._id);
    console.log("Authenticated user:", req.user);
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid token", 400));
  }
};

export const authorizeAdmin = (req, res, next) => {
  console.log("User role:", req.user.role);
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


