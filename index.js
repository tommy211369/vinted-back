require("dotenv").config();
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);

const app = express();
app.use(formidable());
// all websites can connect to API
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// routes import
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
const stripeRoutes = require("./routes/transaction");
app.use(userRoutes);
app.use(offerRoutes);
app.use(stripeRoutes);

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "Welcome on Vinted API by Tommy Thongrasamy !" });
});

app.all("*", (req, res) => {
  res.json(404).json({ message: "Page not found" });
});

app.listen(process.env.PORT, () => {
  console.log("Server has started on port : " + process.env.PORT);
});
