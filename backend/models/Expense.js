const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must contain at least 2 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than zero"]
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Food", "Travel", "Bills", "Shopping", "Health", "Education", "Other"]
    },
    date: {
      type: Date,
      required: [true, "Date is required"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
