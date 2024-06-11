import express from "express";
import {
  adminuploaddocs,
  createUser,
  deleteSingleDocument,
  deleteSingleDocumentCompany,
  deleteUser,
  deletemyDocument,
  forgetpassword,
  getallCompany,
  getallUser,
  getmyprofile,
  login,
  logout,
  resetPasword,
  updatePassword,
  updateRole,
  uploaddocs,
} from "../controllers/userController.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import {upload1} from "../middlewares/imageypload.js"; // Updated path

const router = express.Router();

router.route("/createUser").post(createUser);
router.route("/login").post(login);
router.route("/logout").get(logout);

router.route("/upload").post(isAuthenticated,upload1.array("files"), uploaddocs);
router.route("/role/:id").put(updateRole);
router.route("/forgetpassword").post(forgetpassword);
router.route("/resetpassword").post(resetPasword);
router.route("/me").get(isAuthenticated, getmyprofile);
router.route("/changePassword").post(isAuthenticated, updatePassword);

// Company
router.route("/admin/getallcompany").get(isAuthenticated, authorizeAdmin, getallCompany);
// router.route("/deletecompany/:id").delete(isAuthenticated, authorizeAdmin, deleteCompany);
router.route("/deleteCompanyDoc").delete(isAuthenticated, authorizeAdmin, deleteSingleDocumentCompany);

// Admin upload routes
router.route("/admin/uploaddocs").post(isAuthenticated, authorizeAdmin, upload1.array("files"), adminuploaddocs);
router.route("/admin/uploaddocscompany").post(upload1.array("files"), adminuploaddocs);
router.route("/admin/getallUser").get(isAuthenticated, authorizeAdmin, getallUser);
router.route("/deleteUser/:id").delete(isAuthenticated, authorizeAdmin, deleteUser);
router.route("/deleteDoc").delete(isAuthenticated, authorizeAdmin, deleteSingleDocument);
router.route("/deletemyDoc").delete(isAuthenticated, deletemyDocument);

export default router;
