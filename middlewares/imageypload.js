import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "uploads", // Optional - specify a folder in Cloudinary to store the files
      allowed_formats: ["jpg", "jpeg", "png", "pdf"] // Optional - specify allowed file formats
    }
  });
  
  const upload1 = multer({ storage: storage });
  
  export default upload1;