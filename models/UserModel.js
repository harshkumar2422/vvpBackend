import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    minLength: [6, "password must be atleast 6 character"],
    select: false,
  },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  docs: [
    { title: String, public_id: String, url: String, resource_type: String },
  ],
  numOfDoc: {
    type:Number,
    default:0,  },
  otp: { type: String },
  otpExpiration: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = mongoose.model("User", UserSchema);
