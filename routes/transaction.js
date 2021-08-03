const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Transaction = require("../models/Transaction");

router.post("/payment", async (req, res) => {
  try {
    const response = await stripe.charges.create({
      amount: req.fields.price * 100, // en centimes sur Stripe
      currency: "eur",
      description: "La description du produit...",
      source: req.fields.stripeToken,
    });

    if (response.status === "succeeded") {
      const newTransaction = await new Transaction({
        amount: req.fields.price * 100,
        currency: "eur",
        buyer: req.fields.name,
      });
      await newTransaction.save();

      res.status(200).json({ message: "Payment validated" });
    } else {
      res.status(400).json({ message: "Payment error" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
