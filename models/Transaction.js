const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction", {
  amount: Number,
  currency: String,
  buyer: String,
  items: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
});

module.exports = Transaction;
