const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middlewares/isAuthenticated");

// import du model Offer
const Offer = require("../models/Offer");
const User = require("../models/User");

cloudinary.config({
  cloud_name: "dsg8d0epf",
  api_key: "394875394932391",
  api_secret: "GjBGZ6ZcjF17_hPrnUN3qKoWqOg",
  secure: true,
});

// publier des offres
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

// modifier une annonce
router.put(
  "/user/:id/offer/:offer_id/update",
  isAuthenticated,
  async (req, res) => {
    try {
      // on cherche l'offre du user correspondante à l'id en params
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

// supprimer une offre
router.delete(
  "/user/:id/offer/:offer_id/delete",
  isAuthenticated,
  async (req, res) => {
    try {
      // on cherche l'offre du user correspondante à l'id en params
      const userOffer = await Offer.findOne({
        _id: req.params.offer_id,
        owner: { _id: req.user.id },
      });

      await cloudinary.api.delete_resources_by_prefix(
        `/vinted/offers/${userOffer.id}`
      );

      res.json("ok");
      //   await userOffer.save();

      // if (userOffer) {
      //   // supprime l'image mais pas le dossier dans cloudinary
      //   await cloudinary.uploader.destroy(
      //     `${userOffer.product_image.public_id}`
      //   );
      //   await Offer.findByIdAndDelete(userOffer.id);
      //   res.status(200).json({ message: "Offer deleted successfully" });
      // } else {
      //   res.status(400).json({ message: "Offer not found" });
      // }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// FILTRER LES ANNONCES
router.get("/offers", async (req, res) => {
  try {
    let { title, priceMin, priceMax, sort, page, limit } = req.query;

    let filters = {};
    let sortChoice = {};

    // si query title
    if (title) {
      filters.product_name = new RegExp(title, "i");
    }

    // si query pricemin et pricemax
    if (priceMin) {
      filters.product_price = { $gte: Number(priceMin) };
    }

    if (priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(priceMax);
      } else {
        filters.product_price = { $lte: number(priceMax) };
      }
    }

    // si query sort
    if (sort === "price-asc") {
      sortChoice = { product_price: 1 };
    } else if (sort === "price-desc") {
      sortChoice = { product_price: -1 };
    } else if (sort === "name-asc") {
      sortChoice = { product_name: 1 };
    } else if (sort === "name-desc") {
      sortChoice = { product_name: -1 };
    }

    // Pagination
    let currentPage;

    if (Number(page) < 1) {
      currentPage = 1;
    } else {
      currentPage = Number(page);
    }

    // limit à afficher
    let limitChoice;

    if (Number(limit) < 1 || !limit) {
      limitChoice = 5;
    } else {
      limitChoice = Number(limit);
    }

    // recherche dans la BDD
    const offers = await Offer.find(filters)
      .sort(sortChoice)
      .skip((currentPage - 1) * limitChoice)
      .limit(limitChoice)
      .populate({ path: "owner", select: "account email" });

    // compte le nombre de documents
    const count = await Offer.countDocuments(filters);

    // réponse au client
    res.status(200).json({ count: count, offers });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// TRIE
// router.get("/test_offers", async (req, res) => {

// affiche par rapport au nom du produit :
//   const offers = await Offer.find({
//     product_name: new RegEx(req.query.title, "i"),
//   }).select("product_name product_price");

// affiche par rapport au prix :
// $gte : greater or equal
// $lte : <=
// $gt : >
// $lt : <
// const offers = await Offer.find({
//   product_price: { $lte: 100 },
// }).select("product_name product_price");

// 1 ou -1 (croissant ou décroissant) :
// "asc" ou "desc"
// const offers = await Offer.find()
//   .sort({ product_price: -1 })
//   .select("product_name product_price");

// Pagination .skip() et .limit() :
// skip : ignorer N résultats
// limit : renvoyer M résultats au client
// const offers = await Offer.find()
//   .skip(5)
//   .limit(5)
//   .select("product_name product_price");

// chaîner les instructions
// const offers = await Offer.find({ product_price: { $gte: 100 } })
//   .sort({ product_price: 1 })
//   .skip(0)
//   .limit(2)
//   .select("product_name product_price");

// const count = await Offer.countDocuments(); // renvoie le nombre d'annonces

//   res.json(offers);
// });

// infos sur une offre et son owner avec l'id de l'offre
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
