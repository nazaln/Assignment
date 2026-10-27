require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const expenseRoutes = require("./routes/expenses");

const app = express();
const PORT = process.env.PORT || 5000;

let mongoConnectionPromise = null;

async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes("YOUR-CLUSTER")) {
    throw new Error("MONGODB_URI is missing or invalid.");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState !== 2 || !mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 10000 })
      .then(() => {
        console.log("Connected to MongoDB Atlas");
      })
      .catch((error) => {
        mongoConnectionPromise = null;
        throw error;
      });
  }

  await mongoConnectionPromise;
}

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// Connect to MongoDB before handling expense requests.
app.use("/api/expenses", async (_req, res, next) => {
  try {
    await connectToMongoDB();
    next();
  } catch (error) {
    next(error);
  }
}, expenseRoutes);

// Handle unknown routes.
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Handle errors.
app.use((error, _req, res, _next) => {
  console.error("API error:", error);

  if (
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    return res.status(400).json({ message: error.message });
  }

  if (
    error.name === "MongoServerSelectionError" ||
    error.name === "MongooseServerSelectionError"
  ) {
    return res.status(503).json({
      message: "Database unavailable. Check MongoDB Atlas configuration.",
    });
  }

  if (error.message === "MONGODB_URI is missing or invalid.") {
    return res.status(500).json({
      message: "Server database configuration is missing.",
    });
  }

  res.status(500).json({
    message: "An unexpected server error occurred.",
  });
});

// Export the app for Vercel.
module.exports = app;

// Start the server only when running locally.
if (require.main === module) {
  connectToMongoDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`API listening on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Could not start server:", error.message);
      process.exit(1);
    });
}