const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction", {
  amount: Number,
  currency: String,
  buyer: String,
});

module.exports = Transaction;
