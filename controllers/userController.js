import { User } from "../models/UserModel.js";
import { Company } from "../models/comapnyModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import bcrypt from "bcrypt";
import cloudinary from "cloudinary";
import nodemailer from "nodemailer";
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

export const createUser = async (req, res, next) => {
  try {
    const { type, name, email, password } = req.body;
    if (!name || !email || !password || !type)
      return next(new ErrorHandler("please enter all fields", 400));

    const lowerCaseEmail = email.toLowerCase();
    if (type === "User") {
      let user = await User.findOne({ email: lowerCaseEmail });
      if (user) return next(new ErrorHandler("User already exists", 400));

      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        name,
        email: lowerCaseEmail,
        password: hashedPassword,
      });
      sendToken(user, 201, res, "user created successfully");
    } else {
      let company = await User.findOne({ email: lowerCaseEmail });
      if (company) return next(new ErrorHandler("Company email already registered", 400));

      const hashedPassword = await bcrypt.hash(password, 10);
      company = await Company.create({
        name,
        email: lowerCaseEmail,
        password: hashedPassword,
      });
      sendToken(company, 201, res, "Company email registered successfully");
    }
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { type, email, password } = req.body;
    if (!email || !password || !type)
      return next(new ErrorHandler("please enter all fields", 400));

    const lowerCaseEmail = email.toLowerCase();
    if (type === "User") {
      let user = await User.findOne({ email: lowerCaseEmail }).select("+password");
      if (!user) return next(new ErrorHandler("user doesn't exist", 400));

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return next(new ErrorHandler("Incorrect email or password", 401));

      sendToken(user, 200, res, `welcome back ${user.name}`);
    } else {
      let company = await Company.findOne({ email: lowerCaseEmail }).select("+password");
      if (!company) return next(new ErrorHandler("Company email doesn't exist", 400));

      const isMatch = await bcrypt.compare(password, company.password);
      if (!isMatch)
        return next(new ErrorHandler("Incorrect email or password", 401));

      sendToken(company, 200, res, `welcome back ${company.name}`);
    }
  } catch (error) {
    next(error);
  }
};

export const uploaddocs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { title } = req.body;
    if (!title)
      return next(new ErrorHandler("Please enter the type of details", 404));

    const files = req.files;
    if (!files || files.length === 0)
      return next(new ErrorHandler("No files uploaded", 400));

    const docs1 = [];
    for (const file of files) {
      const result = await cloudinary.v2.uploader.upload(file.path, {
        resource_type: file.mimetype === "application/pdf" ? "raw" : "image",
        folder: "uploads",
      });

      docs1.push({
        title,
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
      });
    }

    user.docs.push(...docs1);
    user.numOfDoc = user.docs.length;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      data: docs1,
      user,
    });
  } catch (error) {
    next(error);
  }
};
export const adminuploaddocs = async (req, res, next) => {
  try {
    const { type, name, email, title } = req.body;

    // Check for mandatory fields
    if (!type || !name || !email || !title) {
      return next(new ErrorHandler("All fields are mandatory", 400));
    }

    // Ensure email is valid and not null
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return next(new ErrorHandler("Valid email is required", 400));
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return next(new ErrorHandler("No files uploaded", 400));
    }

    const docs = [];
    for (const file of files) {
      let resource_type = "image";
      if (file.mimetype === "application/pdf") {
        resource_type = "raw";
      }

      const result = await cloudinary.v2.uploader.upload(file.path, {
        resource_type,
        folder: "uploads",
      });

      docs.push({
        title,
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
      });
    }

    if (type === "User") {
      let user = await User.findOne({ email });

      if (!user) {
        const password = `${name}@123`;
        const hashedPassword = await bcrypt.hash(password, 10);// Ensure password is created here
        user = await User.create({ name, email, password:hashedPassword });
        if (!user) return next(new ErrorHandler("User is not created", 404));
      }

      user.docs.push(...docs);
      user.numOfDoc = user.docs.length;
      await user.save();

      res.status(201).json({
        success: true,
        message: "Documents uploaded successfully",
        user,
      });

    } else if (type === "Company") {
      let company = await Company.findOne({ email });

      if (!company) {
        company = await Company.create({ name, email });
        if (!company) return next(new ErrorHandler("Company is not created", 404));
      }

      company.docs.push(...docs);
      company.numOfDoc = company.docs.length;
      await company.save();

      res.status(201).json({
        success: true,
        message: "Documents uploaded successfully",
        company,
      });
    } else {
      return next(new ErrorHandler("Invalid type specified", 400));
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};




export const updateRole = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }
  if (user.role === "user") {
    user.role = "admin";
  } else {
    user.role = "user";
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "role updated",
  });
};

export const getallUser = async (req, res, next) => {
  try {
    const keyword = req.query.keyword || "";
    const email = req.query.email || "";

    const query = {};

    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }

    if (email) {
      query.email = { $regex: email, $options: "i" };
    }

    const user = await User.find(query);

    if (!user) return next(new ErrorHandler("Users not found", 404));

    res.status(200).json({
      success: true,
      user,
      message:"All Users lists"
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

export const forgetpassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new ErrorHandler("please enter your email", 400));

    const lowerCaseEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowerCaseEmail });
    if (!user)
      return next(
        new ErrorHandler("You are not a User please register your account", 400)
      );

    let otp = "";
    for (let i = 0; i < 4; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "web.nucleas@gmail.com",
        pass: "jwunsrjmxrvqqjid",
      },
    });
    let mailOptions = {
      from: "web.nucleas@gmail.com",
      to: lowerCaseEmail,
      subject: "Forget password verification",
      text: `Your Account Verification Code is ${otp}`,
    };

    let info = await transporter.sendMail(mailOptions);
    if (info) {
      let otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
      const updated = await User.findOneAndUpdate(
        { email: lowerCaseEmail },
        {
          $set: {
            otp: otp,
            otpExpiration: otpExpiration,
          },
        },
        { new: true }
      );
      if (updated) {
        res.status(201).json({
          success: true,
          message: "OTP sent to your email successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Invalid error",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal server Error", 500));
  }
};

export const resetPasword = async (req, res, next) => {
  try {
    const { email, otp, password, confirmPassowrd } = req.body;
    if (!otp || !password || !confirmPassowrd)
      return next(new ErrorHandler("please eneter all fields"));
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return next(
        new ErrorHandler("User not exist plesase register your account", 400)
      );
    if (user.otp !== otp || user.otpExpiration < Date.now())
      return next(new ErrorHandler("inavlid otp", 400));
    if (password !== confirmPassowrd)
      return next(
        new ErrorHandler("password and confirmPassword are not same")
      );
    user.password = bcrypt.hashSync(password, 10) || user.password;
    (user.otp = ""), (user.otpExpiration = ""), user.save();
    res.status(200).json({
      success: true,
      message: "password has been changed you may login",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal server Eror", 500));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler("User doesn't exist", 400));

    // Delete documents from Cloudinary and local filesystem
    if (user.docs.length > 0) {
      for (let i = 0; i < user.docs.length; i++) {
        const doc = user.docs[i];

        // Delete from Cloudinary
        await cloudinary.v2.uploader.destroy(doc.public_id, {
          resource_type: doc.resource_type,
        });
      }
    }

    // Delete user from the database
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User and their documents deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

export const deleteSingleDocument = async (req, res, next) => {
  try {
    const { userId, docsId } = req.query;
    const user = await User.findById(userId);
    if (!user) return next(new ErrorHandler("User not found", 404));
    const docss = user.docs.find((item) => {
      if (item._id.toString() === docsId.toString()) return item;
    });
    await cloudinary.v2.uploader.destroy(docss.public_id, {
      resource_type: docss.resource_type,
    });
    user.docs = user.docs.filter((item) => {
      if (item._id.toString() !== docsId.toString()) return item;
    });
    user.numOfDoc = user.docs.length;
    await user.save();
    res.status(200).json({
      success: true,
      message:"Document is deleted"
    });
  } catch (error) {
    console.log(error);
  }
};

export const getmyprofile = async (req, res, next) => {
  try {
      const user = await User.findById(req.user);
      res.status(200).json({
        success: true,
        user,
      });
    
    
  } catch (error) {
    console.log(error);x
    res.status(500).json({
      success: false,
      message:"Internal server Error"
    })
  }
}

export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("please enter all fields", 400));
  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return next(new ErrorHandler("Incorrect oldPassword ", 400));

  if (newPassword)
    user.password = bcrypt.hashSync(newPassword, 10) || user.password;

  await user.save();
  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
};


export const logout = async (req, res, next) => {
  res
    .status(200)
    .clearCookie("token",{
      // expires: new Date(Date.now()),
      httpOnly: true,
      secure:true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
};




export const getallCompany = async (req, res, next) => {
  try {
    const keyword = req.query.keyword || "";
    const email = req.query.email || "";
    const comapny = await Company.find({
      name: {
        $regex: keyword,
        $options: "i",
      },
      email: {
        $regex: email,
        $options: "i",
      },
    });

    if (!comapny) return next(new ErrorHandler("Company registered email does not found", 404));
    res.status(200).json({
      success: true,
      comapny,
      message:"All company lists"
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal server Error", 500));
  }
};

export const deleteSingleDocumentCompany = async (req, res, next) => {
  try {
    const { CompanyId, docsId } = req.query;
    const company = await Company.findById(CompanyId);
    if (!company) return next(new ErrorHandler("User not found", 404));
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
};
export const deletemyDocument = async (req, res, next) => {
  try {
    const {  docsId } = req.query;
    const user = await User.findById(req.user);
    if (!user) return next(new ErrorHandler("User not found", 404));
    const docss = user.docs.find((item) => {
      if (item._id.toString() === docsId.toString()) return item;
    });
    await cloudinary.v2.uploader.destroy(docss.public_id, {
      resource_type: docss.resource_type,
    });
    user.docs = user.docs.filter((item) => {
      if (item._id.toString() !== docsId.toString()) return item;
    });
    user.numOfDoc = user.docs.length;
    await user.save();
    res.status(200).json({
      success: true,
      message:"Document is deleted"
    });
  } catch (error) {
    console.log(error);
  }
};