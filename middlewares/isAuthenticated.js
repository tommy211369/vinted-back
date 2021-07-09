const mongoose = require("mongoose");

const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    // on récupère le token
    const token = req.headers.authorization.replace("Bearer ", "");

    // on cherche dans la BDD si un user a ce token (on décide d'afficher juste l'account)
    const user = await User.findOne({ token: token }).select("account");
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
};

module.exports = isAuthenticated;
