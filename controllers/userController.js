//userController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail, findUserById } = require("../models/userModel");

// ✅ Register new user
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, passwordHash, role });

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Regular user login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Login attempt for:", email);

    const user = await findUserByEmail(email);
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("🔒 Comparing password...");
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      console.log("❌ Invalid password");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("✅ Password correct. Generating token...");
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Login successful");
    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Server error during login:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Hardcoded Admin Login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // Hardcoded credentials check
  if (email === "admin@cff" && password === "123456") {
    const token = jwt.sign(
      { user_id: 0, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Admin login successful",
      token,
      user: {
        user_id: 0,
        name: "Super Admin",
        email,
        role: "admin",
      },
    });
  }

  return res.status(401).json({ error: "Unauthorized: Invalid admin credentials" });
};

// ✅ Get current user profile
const getProfile = async (req, res) => {
  try {
    if (req.user.role === "admin") {
  return res.json({
    user_id: 0,
    name: "Super Admin",
    email: "admin@cff",
    role: "admin",
    created_at: "N/A"
  });
}

const user = await findUserById(req.user.user_id);
if (!user) return res.status(404).json({ error: "User not found" });

res.json({
  user_id: user.user_id,
  name: user.name,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
});

    res.json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    });
  } catch (err) {
    console.error("❌ Profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  getProfile,
};