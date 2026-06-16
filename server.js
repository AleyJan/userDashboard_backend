const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const { connectRedis } = require("./config/redis");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const todoRoutes = require("./routes/todoRoutes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://user-dashboard-frontend-gray.vercel.app",
      "https://user-dashboard-frontend-leowqwhwr-ali-jans-projects-49e3769a.vercel.app",
    ],
  }),
);
app.use(express.json());

// DB connections
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI, { bufferCommands: false });
  await connectRedis();
  isConnected = true;
  console.log("MongoDB + Redis Connected");
}

// Middleware to connect before every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "DB connection failed" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/todos", todoRoutes);
app.get("/test", (req, res) => {
  res.json({
    mongo_uri: process.env.MONGO_URI ? "✅ loaded" : "❌ missing",
    redis_host: process.env.REDIS_HOST ? "✅ loaded" : "❌ missing",
    jwt: process.env.JWT_SECRET ? "✅ loaded" : "❌ missing",
  });
});

// ✅ Export instead of listen
module.exports = app;
