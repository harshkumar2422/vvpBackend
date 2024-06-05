import express from "express";
// import upload from "../utils/multer.js";
import { adminuploaddocs, createUser, deleteSingleDocument, deleteSingleDocumentCompany, deleteUser, forgetpassword, getallCompany, getallUser, getmyprofile, login, logout, resetPasword, updatePassword, updateRole, uploaddocs } from "../controllers/userController.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import upload1 from "../middlewares/imageypload.js";
const router = express.Router();

router.route("/createUser").post(createUser);//done
router.route("/login").post(login);//done
router.route("/logout").get(logout);//done

router.route("/upload").post(isAuthenticated,upload1.array('files'),uploaddocs)
router.route("/role/:id").put(updateRole)//done
router.route("/forgetpassword").post(forgetpassword); //done
router.route("/resetpassword").post(resetPasword);//done
router.route("/me").get(isAuthenticated,getmyprofile)
router.route("/changePassword").post(isAuthenticated, updatePassword)

//compnay

router.route("/admin/getallcompany").get(isAuthenticated,authorizeAdmin,getallCompany)
router.route("/deletCompanyeDoc").delete(isAuthenticated,authorizeAdmin,deleteSingleDocumentCompany);

// Routes for adminupload.array('files')
router.route("/admin/uploaddocs").post(upload1.array('files'),adminuploaddocs)//done
router.route("/admin/uploaddocscompany").post(upload1.array('files'),adminuploaddocs)//done
router.route("/admin/getallUSer").get(isAuthenticated,authorizeAdmin,getallUser)//done
router.route("/deleteUser/:id").delete(isAuthenticated,authorizeAdmin,deleteUser);//done
router.route("/deleteDoc").delete(isAuthenticated,authorizeAdmin,deleteSingleDocument);//done
export default router;