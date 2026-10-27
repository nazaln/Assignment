const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../models/Expense");

const router = express.Router();
const categories = ["Food", "Travel", "Bills", "Shopping", "Health", "Education", "Other"];

function validateExpense(body) {
  const errors = [];
  if (typeof body.title !== "string" || body.title.trim().length < 2) {
    errors.push("Title must contain at least 2 characters.");
  }
  if (body.title && body.title.trim().length > 100) {
    errors.push("Title cannot exceed 100 characters.");
  }
  const amount = Number(body.amount);
  if (body.amount === "" || body.amount === null || body.amount === undefined ||
      !Number.isFinite(amount) || amount <= 0) {
    errors.push("Amount must be a number greater than zero.");
  }
  if (!categories.includes(body.category)) errors.push("Choose a valid category.");
  if (!body.date || Number.isNaN(new Date(body.date).getTime())) {
    errors.push("Choose a valid date.");
  }
  return errors;
}

router.get("/", async (_req, res, next) => {
  try {
    const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid expense ID." });
    }
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found." });
    res.json(expense);
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const errors = validateExpense(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(" "), errors });
    const expense = await Expense.create({
      title: req.body.title.trim(),
      amount: Number(req.body.amount),
      category: req.body.category,
      date: new Date(req.body.date)
    });
    res.status(201).json({ message: "Expense added successfully.", expense });
  } catch (error) { next(error); }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid expense ID." });
    }
    const errors = validateExpense(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(" "), errors });
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title.trim(),
        amount: Number(req.body.amount),
        category: req.body.category,
        date: new Date(req.body.date)
      },
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: "Expense not found." });
    res.json({ message: "Expense updated successfully.", expense });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid expense ID." });
    }
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found." });
    res.json({ message: "Expense deleted successfully." });
  } catch (error) { next(error); }
});

module.exports = router;
