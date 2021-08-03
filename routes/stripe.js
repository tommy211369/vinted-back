const express = require("express");
const router = express.Router();

router.post("/payment", async (req, res) => {
  console.log("hELLO Back");
  try {
    //req.fields.stripeToken
    //req.fields.price
    // requête à l'api stripe

    const response = await stripe.charges.create({
      amount: req.fields.price * 100, // en centimes sur Stripe
      currency: "eur",
      description: "La description du produit...",
      source: req.fields.stripeToken,
    });

    console.log("La réponse de Stripe : ", response);
    res.json("Ok");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
