import jwt from "jsonwebtoken";
import fs from "fs/promises";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

import HttpError from "../helpers/HttpError.js";
import cloudinary from "../helpers/cloudinary.js";

import * as authServices from "../services/authServices.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import sendEmail from "../helpers/sendEmail.js";

const { JWT_SECRET, BASE_URL, BASE_URL_FRONT } = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;

  const user = await authServices.findUser({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const username = email.split("@")[0];

  // const newUser = await authServices.signup({
  //   email,
  //   username,
  //   password,
  // });

  // const payload = {
  //   id: newUser._id,
  // };

  // const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

  // await authServices.updateUser({ _id: newUser._id }, { token });

  const verificationToken = nanoid();
  const newUser = await authServices.signup({
    ...req.body,
    username,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a href="${BASE_URL}/api/users/verify/${verificationToken}" target="_blank">
        <button 
        style="border-radius: 5px; border: 1px solid transparent; background-color: #d7e3ff; color: #407bff;"
        >Press to continue using Water Tracker</button>
        </a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    // token,
    user: {
      username,
      email,
      dailyWaterNorm: newUser.dailyWaterNorm,
      weight: newUser.weight,
      sportTime: newUser.sportTime,
    },
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await authServices.findUser({ verificationToken });

  if (!user) {
    throw HttpError(404, "User not found");
  }


  const { _id: id } = user;

    const payload = { id };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await authServices.updateUser({ _id: user._id }, { verify: true, verificationToken: null, token });

    res.redirect(`${BASE_URL_FRONT}/home?token=${token}`)
};

const resendVerify = async (req, res) => {
  const { email } = req.body;
  const user = await authServices.findUser({ email });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a href="${BASE_URL}/api/users/verify/${user.verificationToken}" target="_blank">
        <button 
        style="border-radius: 5px; border: 1px solid transparent; background-color: #d7e3ff; color: #407bff;"
        >Press to continue using Water Tracker</button>
        </a>`,
  };

  await sendEmail(verifyEmail);

  res.json({ message: "Verification email sent" });
};

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
      dailyWaterNorm: user.dailyWaterNorm,
      weight: user.weight,
      sportTime: user.sportTime,
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
    weight,
    sportTime,
  });
};

const updateUserInfo = async (req, res) => {
  const {
    username,
    email,
    password,
    passwordNew,
    gender,
    dailyWaterNorm,
    weight,
    sportTime,
  } = req.body;
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
    ...(gender && { gender }),
    ...(dailyWaterNorm && { dailyWaterNorm }),
    ...(weight && { weight }),
    ...(sportTime && { sportTime }),
    ...avatarUpdate,
  };

  if (passwordNew) {
    const currentUser = await authServices.findUser({ _id });
    const comparePassword = await authServices.validatePassword(
      password,
      currentUser.password
    );

    if (!comparePassword) {
      throw HttpError(401, "Old password is wrong");
    }
    const hashedPassword = await bcrypt.hash(passwordNew, 10);
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
    weight: updatedUserData.weight,
    sportTime: updatedUserData.sportTime,
  });
};

const delUser = async (req, res) => {
  const { email } = req.body;
    const user = await authServices.findUser({ email }); 
    if (!user) {
        throw HttpError(404);
    }
    if (!user.verify) {
        const result = await authServices.removeUser({ email });
    if (!result) {
        throw HttpError(404);
    }
      res.json({ message: "The user has been deleted" });
    } else {
      res.json({ message: "Verification has already been passed" });
    }
};

export default {
  signup: ctrlWrapper(signup),
  verify: ctrlWrapper(verify),
  resendVerify: ctrlWrapper(resendVerify),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  signout: ctrlWrapper(signout),
  updateUserInfo: ctrlWrapper(updateUserInfo),
  delUser: ctrlWrapper(delUser)
};
