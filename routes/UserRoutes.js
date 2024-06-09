import express from "express";
// import upload from "../utils/multer.js";
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
import upload1 from "../middlewares/imageypload.js";
import { deleteCompany, deletecompanyDoc } from "../controllers/companycontroller.js";
const router = express.Router();

router.route("/createUser").post(createUser); //done
router.route("/login").post(login); //done
router.route("/logout").get(logout); //done

router
  .route("/upload")
  .post(isAuthenticated, upload1.array("files"), uploaddocs);
router.route("/role/:id").put(updateRole); //done
router.route("/forgetpassword").post(forgetpassword); //done
router.route("/resetpassword").post(resetPasword); //done
router.route("/me").get(isAuthenticated, getmyprofile);
router.route("/changePassword").post(isAuthenticated, updatePassword);

//compnay

router
  .route("/admin/getallcompany")
  .get(isAuthenticated,authorizeAdmin, getallCompany);//done
router
  .route("/deletecompany/:id")
  .delete(isAuthenticated,authorizeAdmin, deleteCompany);
router
  .route("/deletCompanyeDoc")
  .delete(isAuthenticated, authorizeAdmin, deleteSingleDocumentCompany);

// Routes for adminupload.array('files')
router.route("/admin/uploaddocs").post(isAuthenticated,authorizeAdmin,upload1.array("files"), adminuploaddocs); //done
router
  .route("/admin/uploaddocscompany")
  .post(upload1.array("files"), adminuploaddocs); //done
router
  .route("/admin/getallUser")
  .get(isAuthenticated,authorizeAdmin,getallUser); //done
router
  .route("/deleteUser/:id")
  .delete(isAuthenticated, authorizeAdmin, deleteUser); //done
router
  .route("/deleteDoc")
  .delete(isAuthenticated, authorizeAdmin, deleteSingleDocument); //done
router
  .route("/deletemyDoc")
  .delete(isAuthenticated, deletemyDocument); //done
router
  .route("/deleteCompanyDoc")
  .delete(isAuthenticated, authorizeAdmin, deletecompanyDoc); //done
export default router;
