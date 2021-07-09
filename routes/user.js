const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// import du model User
const User = require("../models/User");

cloudinary.config({
  cloud_name: "dsg8d0epf",
  api_key: "394875394932391",
  api_secret: "GjBGZ6ZcjF17_hPrnUN3qKoWqOg",
  secure: true,
});

router.post("/user/signup", async (req, res) => {
  try {
    // rechercher si l'email existe déjà :
    const emailExist = await User.findOne({ email: req.fields.email });

    if (emailExist) {
      res.status(409).json({ message: "User already exists" });
    } else if (req.fields.username === "") {
      res.status(400).json({ message: "Username is required" });
    } else {
      // récupérer le mot de passe
      const password = req.fields.password;
      // générer le SALT :
      const userSalt = uid2(16);

      // générer le HASH :
      const userHash = SHA256(password + userSalt).toString(encBase64);

      // générer un TOKEN :
      const userToken = uid2(64);

      //on récupère la picture de l'user
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

      res.json(resNewUser);
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

//login
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

        res.status(200).json(resUser);
      } else {
        res.status(400).json({ message: "Wrong password" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
