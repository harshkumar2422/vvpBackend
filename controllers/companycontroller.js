import { Company } from "../models/comapnyModel.js";
import cloudinary from "cloudinary"
import ErrorHandler from "../utils/ErrorHandler.js";

export const deleteCompany = async (req, res, next) => {
    try {
      const comapny = await Company.findById(req.params.id);
      if (!comapny) return next(new ErrorHandler("Company doesn't exist", 400));
  
      // Delete documents from Cloudinary and local filesystem
      if (comapny.docs.length > 0) {
        for (let i = 0; i < comapny.docs.length; i++) {
          const doc = comapny.docs[i];
  
          // Delete from Cloudinary
          await cloudinary.v2.uploader.destroy(doc.public_id, {
            resource_type: doc.resource_type,
          });
        }
      }
  
      // Delete user from the database
      await comapny.deleteOne();
  
      res.status(200).json({
        success: true,
        message: "comapny and their documents deleted successfully",
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandler("Internal server error", 500));
    }
};
export const deletecompanyDoc = async (req, res, next) => {
  try {
    const { companyId, docsId } = req.query;
    const company = await Company.findById(companyId);
    if (!company) return next(new ErrorHandler("company not found", 404));
    const docss = company.docs.find((item) => {
      if (item._id.toString() === docsId.toString()) return item;
    });
    await cloudinary.v2.uploader.destroy(docss.public_id, {
      resource_type: docss.resource_type,
    });
    company.docs = company.docs.filter((item) => {
      if (item._id.toString() !== docsId.toString()) return item;
    });
    company.numOfDoc = company.docs.length;
    await company.save();
    res.status(200).json({
      success: true,
      message:"Document is deleted"
    });
  } catch (error) {
    console.log(error);
  }
  }