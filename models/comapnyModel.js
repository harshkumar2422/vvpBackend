import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    require: true,
    index: true,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    minLength: [6, "password must be atleast 6 character"],
    select: false,
  },
  docs: [
    {
      title: String, public_id: String, url: String, resource_type: String, createdAt: {
        type: Date,
        default: Date.now,
    } },
  ],
  numOfDoc: {
    type: Number,
    default: 0,
  },
  otp: { type: String },
  otpExpiration: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Company = mongoose.model("Company", CompanySchema);
