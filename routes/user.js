const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// import models
const User = require("../models/User");
const Offer = require("../models/Offer");

// cloudinary.config({
//   cloud_name: "dsg8d0epf",
//   api_key: "394875394932391",
//   api_secret: "GjBGZ6ZcjF17_hPrnUN3qKoWqOg",
//   secure: true,
// });

// SIGN UP
router.post("/user/signup", async (req, res) => {
  try {
    const emailExist = await User.findOne({ email: req.fields.email });

    if (emailExist) {
      res.status(409).json({ message: "User already exists" });
    } else if (req.fields.username === "") {
      res.status(400).json({ message: "Username is required" });
    } else {
      const password = req.fields.password;
      const userSalt = uid2(16);
      const userHash = SHA256(password + userSalt).toString(encBase64);
      const userToken = uid2(64);

      const userAvatar = await cloudinary.uploader.upload(
        req.files.picture.path,
        {
          folder: `/vinted/users/${req.fields.email}`,
        }
      );

      const newUser = await new User({
        email: req.fields.email,
        account: {
          username: req.fields.username,
          phone: req.fields.phone,
          avatar: userAvatar,
        },
        token: userToken,
        hash: userHash,
        salt: userSalt,
      });

      await newUser.save();

      const resNewUser = {
        token: newUser.token,
        account: newUser.account,
      };

      res.json({ message: "Signed up successfully", resNewUser });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// LOGIN
router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });

    if (user) {
      const password = req.fields.password;
      const newHash = SHA256(password + user.salt).toString(encBase64);

      if (newHash === user.hash) {
        const resUser = {
          _id: user.id,
          token: user.token,
          account: user.account,
        };

        res.status(200).json({ message: "Logged in successfully", resUser });
      } else {
        res.status(400).json({ message: "Wrong password" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized : user not recognized" });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
