import jwt from "jsonwebtoken";
import fs from "fs/promises";

import HttpError from "../helpers/HttpError.js";
import cloudinary from "../helpers/cloudinary.js";

import * as authServices from "../services/authServices.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";

const { JWT_SECRET } = process.env;

const signup = async (req, res) => {
  const { email } = req.body;

  const user = await authServices.findUser({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const newUser = await authServices.signup(req.body);

  res.status(201).json({
    email: newUser.email,
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await authServices.findUser({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const comparePassword = await authServices.validatePassword(
    password,
    user.password
  );

  if (!comparePassword) {
    throw HttpError(401, "Email or password is wrong");
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
      email: user.email,
    },
  });
};

const getCurrent = async (req, res) => {
  const { email } = req.user;

  res.json({
    email,
  });
};

const signout = async (req, res) => {
  const { _id } = req.user;
  await authServices.updateUser({ _id }, { token: "" });

  res.json({
    message: "Signout success",
  });
};

export const updateAvatar = async (req, res) => {
  if (!req.file) {
    throw HttpError(400, "Please provide an image for the avatar.");
  }

  const { _id } = req.user;

  const currentUser = await authServices.findUser({ _id });

  if (currentUser.avatarPublicId) {
    await cloudinary.uploader.destroy(currentUser.avatarPublicId);
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "avatars",
  });

  await fs.unlink(req.file.path);

  const updatedUserAvatar = await authServices.updateUser(
    { _id },
    {
      avatarURL: result.url,
      avatarPublicId: result.public_id,
    }
  );

  if (!updatedUserAvatar) {
    return res.status(401).json({ message: "Not authorized" });
  }

  res.json({ avatarURL: result.url });
};

export default {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  signout: ctrlWrapper(signout),
  updateAvatar: ctrlWrapper(updateAvatar),
};
