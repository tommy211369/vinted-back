const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middlewares/isAuthenticated");

// import models
const Offer = require("../models/Offer");
const User = require("../models/User");

// cloudinary.config({
//   cloud_name: "dsg8d0epf",
//   api_key: "394875394932391",
//   api_secret: "GjBGZ6ZcjF17_hPrnUN3qKoWqOg",
//   secure: true,
// });

// PUBLISH OFFERS
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    let { title, description, price, brand, size, condition, color, city } =
      req.fields;
    const newOffer = await new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { ÉTAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
      owner: req.user,
    });

    const userImage = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/vinted/offers/${newOffer.id}`,
    });

    newOffer.product_image = userImage;

    await newOffer.save();
    res.json({
      message: `${newOffer.owner.account.username} published a new offer  `,
      offer: newOffer,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE AN OFFER
router.put(
  "/user/:id/offer/:offer_id/update",
  isAuthenticated,
  async (req, res) => {
    try {
      const userOffer = await Offer.findOne({
        _id: req.params.offer_id,
        owner: { _id: req.user.id },
      });
      console.log(userOffer);

      if (userOffer) {
        userOffer.product_name = req.fields.title;
        userOffer.product_description = req.fields.description;
        userOffer.product_price = req.fields.price;
        await userOffer.save();
        res.status(200).json({ message: "Offer updated successfully" });
      } else {
        res.status(400).json({ message: "Offer not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// DELETE AN OFFER
router.delete(
  "/user/:id/offer/:offer_id/delete",
  isAuthenticated,
  async (req, res) => {
    try {
      const userOffer = await Offer.findOne({
        _id: req.params.offer_id,
        owner: { _id: req.user.id },
      });

      if (userOffer) {
        await Offer.findByIdAndDelete(userOffer.id);
        res.status(200).json({ message: "Offer deleted successfully" });
      } else {
        res.status(400).json({ message: "Offer not found" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// FILTER OFFERS
router.get("/offers", async (req, res) => {
  try {
    let { title, priceMin, priceMax, sort, page, limit } = req.query;

    let filters = {};
    let sortChoice = {};

    if (title) {
      filters.product_name = new RegExp(title, "i");
    }

    if (priceMin) {
      filters.product_price = { $gte: Number(priceMin) };
    }

    if (priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(priceMax);
      } else {
        filters.product_price = { $lte: Number(priceMax) };
      }
    }

    if (sort === "price-asc") {
      sortChoice = { product_price: 1 };
    } else if (sort === "price-desc") {
      sortChoice = { product_price: -1 };
    } else if (sort === "name-asc") {
      sortChoice = { product_name: 1 };
    } else if (sort === "name-desc") {
      sortChoice = { product_name: -1 };
    }

    let currentPage;

    if (Number(page) < 1) {
      currentPage = 1;
    } else {
      currentPage = Number(page);
    }

    let limitChoice;

    if (Number(limit) < 1 || !limit) {
      limitChoice = 5;
    } else {
      limitChoice = Number(limit);
    }

    const offers = await Offer.find(filters)
      .sort(sortChoice)
      .skip((currentPage - 1) * limitChoice)
      .limit(limitChoice)
      .populate({ path: "owner", select: "account email" });

    const count = await Offer.countDocuments(filters);

    res.status(200).json({ count: count, offers });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DETAILS ABOUT AN OFFER AND ITS OWNER
router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById({ _id: req.params.id }).populate({
      path: "owner",
      select: "account email",
    });

    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
