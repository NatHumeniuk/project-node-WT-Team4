import { Schema, model } from "mongoose";

import { handleSaveError, setUpdateSettings } from "./hooks.js";

import { patternEmail } from "../constants/user-constants.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      unique: true,
      match: patternEmail,
      required: [true, "Email is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      maxlength: 64,
    },
    gender: {
      type: String,
      enum: ["Woman", "Man"],
      default: "Man",
    },
    token: {
      type: String,
      default: null,
    },
    avatarURL: {
      type: String,
    },
    avatarPublicId: {
      type: String,
    },
    dailyWaterNorm: {
      type: Number,
      default: 2000,
      min: [1, "Daily water norm cannot be less than 1"],
      max: [15000, "Daily water norm cannot exceed 15000ml"],
    },
    weight: {
      type: Number,
    },
    sportTime: {
      sportTime: Number,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", setUpdateSettings);

userSchema.post("findOneAndUpdate", handleSaveError);

const User = model("user", userSchema);
export default User;
