const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction", {
  amount: Number,
  currency: String,
});

module.exports = Transaction;
