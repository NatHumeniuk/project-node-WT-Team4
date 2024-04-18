import HttpError from "../helpers/HttpError.js";

import * as waterServices from "../services/waterServices.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";

const createPortion = async (req, res) => {
  const { _id: owner } = req.user;

  const result = await waterServices.addPortionWater({
    ...req.body,
    owner,
  });
  res.status(200).json({ result });
};

export default {
  createPortion: ctrlWrapper(createPortion),
};
