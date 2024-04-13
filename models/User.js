import { Schema, model } from "mongoose";

import { handleSaveError, setUpdateSettings } from "./hooks.js";

import { patternEmail } from "../constants/user-constants.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
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
      default: 2.0,
      min: [0, "Daily water norm cannot be negative"],
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", setUpdateSettings);

userSchema.post("findOneAndUpdate", handleSaveError);

const User = model("user", userSchema);
export default User;
