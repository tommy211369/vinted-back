const mongoose = require("mongoose");

const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", "");

    const user = await User.findOne({ token: token });
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).json({ AuthentificationMessage: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
};

module.exports = isAuthenticated;
