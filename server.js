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

// Separate flags for each connection
let mongoConnected = false;
let redisConnected = false;

async function connectMongo() {
  if (mongoConnected) return;
  await mongoose.connect(process.env.MONGO_URI, { bufferCommands: false });
  mongoConnected = true;
  console.log("✅ MongoDB Connected");
}

async function connectRedisOnce() {
  if (redisConnected) return;
  try {
    await connectRedis();
    redisConnected = true;
    console.log("✅ Redis Connected");
  } catch (err) {
    // Redis failing should NOT block the app
    console.error("Redis connection failed:", err.message);
  }
}

// Only wait for MongoDB — Redis connects in background
app.use(async (req, res, next) => {
  try {
    await connectMongo();
    connectRedisOnce(); // fire and forget — don't await
    next();
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    res.status(500).json({ error: "DB connection failed" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/todos", todoRoutes);

app.get("/test", (req, res) => {
  res.json({
    mongo: mongoConnected ? "✅ connected" : "❌ not connected",
    redis: redisConnected ? "✅ connected" : "❌ not connected",
    mongo_uri: process.env.MONGO_URI ? "✅ loaded" : "❌ missing",
    redis_host: process.env.REDIS_HOST ? "✅ loaded" : "❌ missing",
    jwt_secret: process.env.JWT_SECRET ? "✅ loaded" : "❌ missing",
    cloudinary_name: process.env.CLOUDINARY_NAME ? "✅ loaded" : "❌ missing",
    cloudinary_key: process.env.CLOUDINARY_KEY ? "✅ loaded" : "❌ missing",
    cloudinary_secret: process.env.CLOUDINARY_SECRET ? "✅ loaded" : "❌ missing",
  });
});

module.exports = app;
