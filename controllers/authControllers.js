import jwt from "jsonwebtoken";
import fs from "fs/promises";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

import HttpError from "../helpers/HttpError.js";
import cloudinary from "../helpers/cloudinary.js";

import * as authServices from "../services/authServices.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import sendEmail from "../helpers/sendEmail.js";

const { JWT_SECRET, BASE_URL } = process.env;

const signup = async (req, res) => {
  const { email } = req.body;

  // const verificationToken = nanoid();

  const user = await authServices.findUser({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const username = email.split("@")[0];

  const newUser = await authServices.signup({
    ...req.body,
    username,
  });
  // const newUser = await authServices.signup({
  //   ...req.body,
  //   username,
  //   verificationToken,
  // });

  // const verifyEmail = {
  //   to: email,
  //   subject: "Verify email",
  //   html: `<a href="${BASE_URL}/api/users/verify/${verificationToken}" target="_blank">Click to verify</a>`,
  // };

  // await sendEmail(verifyEmail);

  res.status(201).json({
    username: newUser.username,
    email: newUser.email,
  });
};

// const verify = async (req, res) => {
//   const { verificationToken } = req.params;
//   const user = await authServices.findUser({ verificationToken });

//   if (!user) {
//     throw HttpError(404, "User not found");
//   }

//   await authServices.updateUser(
//     { _id: user._id },
//     { verify: true, verificationCode: "" }
//   );
//   res.json({ message: "Verification successful" });
// };

// const resendVerify = async (req, res) => {
//   const { email } = req.body;
//   const user = await authServices.findUser({ email });

//   if (!user) {
//     throw HttpError(404, "User not found");
//   }

//   if (user.verify) {
//     throw HttpError(400, "Verification has already been passed");
//   }

//   const verifyEmail = {
//     to: email,
//     subject: "Verify email",
//     html: `<a href="${BASE_URL}/api/users/verify/${user.verificationToken}" target="_blank">Click to verify</a>`,
//   };

//   await sendEmail(verifyEmail);

//   res.json({ message: "Verification email sent" });
// };

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await authServices.findUser({ email });

  if (!user) {
    throw HttpError(401, "Email is wrong");
  }
  // if (!user.verify) {
  //   throw HttpError(401, "Email not verify");
  // }

  const comparePassword = await authServices.validatePassword(
    password,
    user.password
  );

  if (!comparePassword) {
    throw HttpError(401, "Password is wrong");
  }

  const { _id: id } = user;

  const payload = {
    id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await authServices.updateUser({ _id: id }, { token });

  res.json({
    token,
    user: {
      username: user.username,
      email: user.email,
      avatarURL: user.avatarURL,
    },
  });
};

const signout = async (req, res) => {
  const { _id } = req.user;
  await authServices.updateUser({ _id }, { token: "" });

  res.json({
    message: "Signout success",
  });
};

const getCurrent = async (req, res) => {
  const { username, email, gender, avatarURL, dailyWaterNorm } = req.user;

  res.json({
    username,
    email,
    gender,
    avatarURL,
    dailyWaterNorm,
  });
};

const updateUserInfo = async (req, res) => {
  const { username, email, password, gender, dailyWaterNorm } = req.body;
  const { _id } = req.user;

  let avatarUpdate = {};

  if (req.file) {
    const currentUser = await authServices.findUser({ _id });

    if (currentUser.avatarPublicId) {
      await cloudinary.uploader.destroy(currentUser.avatarPublicId);
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
    });

    await fs.unlink(req.file.path);

    avatarUpdate = {
      avatarURL: result.url,
      avatarPublicId: result.public_id,
    };
  }

  const updatedUserData = {
    ...(username && { username }),
    ...(email && { email }),
    ...(password && { password }),
    ...(gender && { gender }),
    ...(dailyWaterNorm && { dailyWaterNorm }),
    ...avatarUpdate,
  };

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updatedUserData.password = hashedPassword;
  }

  if (email) {
    const { email } = req.body;
    const userUpd = await authServices.findUser({ email });
    if (userUpd) {
      throw HttpError(409, "Email in use");
    }
    updatedUserData.email = email;
  }

  const updatedUser = await authServices.updateUser({ _id }, updatedUserData);

  if (!updatedUser) {
    return res.status(400).json({ message: "User update failed" });
  }

  res.json({
    username: updatedUserData.username,
    email: updatedUserData.email,
    gender: updatedUserData.gender,
    avatarURL: avatarUpdate.avatarURL,
    dailyWaterNorm: updatedUserData.dailyWaterNorm,
  });
};

export default {
  signup: ctrlWrapper(signup),
  // verify: ctrlWrapper(verify),
  // resendVerify: ctrlWrapper(resendVerify),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  signout: ctrlWrapper(signout),
  updateUserInfo: ctrlWrapper(updateUserInfo),
};
