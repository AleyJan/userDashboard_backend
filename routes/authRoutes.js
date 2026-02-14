const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/register", upload.single("image"), async (req, res) => {
  try {
    // 1. Log to see what's actually arriving in Vercel logs
    // console.log("Files:", req.file);
    // console.log("Body:", req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ msg: "Please fill in all fields (username, email, password)" });
    }

    if (password.length < 6)
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters" });

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists)
      return res.status(400).json({ msg: "Username or Email already taken" });

    // Handle Cloudinary URL
    const profilePic = req.file ? req.file.path : undefined;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      profilePic,
    });

    res.status(201).json({ msg: "Registered successfully" });
  } catch (err) {
    console.error("Detailed Register Error:", err);
    res
      .status(500)
      .json({ msg: err.message || "Server error during registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    // console.log("Login Attempt Body:", req.body); // Check if this shows your email/pass
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    // console.log("User found in DB:", user ? "Yes" : "No");

    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
