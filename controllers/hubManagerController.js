const pool = require("../config/db");
const bcrypt = require("bcrypt");

// GET: All Hub Managers

exports.getAllHubManagers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, name, email, role, created_at 
       FROM hm_users 
       WHERE role = 'Hub Manager' 
       ORDER BY user_id DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching hub managers:", error);
    res.status(500).json({ error: "Failed to fetch hub managers" });
  }
};

// POST: Create New Hub Manager
exports.createHubManager = async (req, res) => {
  const { name, email, password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    // Check if email already exists
    const existing = await pool.query(
      "SELECT * FROM hm_users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO hm_users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)`,
      [name, email, hashedPassword, "Hub Manager"]
    );

    res.status(201).json({ message: "Hub Manager created successfully" });
  } catch (error) {
    console.error("Error creating hub manager:", error);
    res.status(500).json({ error: "Failed to create hub manager" });
  }
};



// PUT: Update Hub Manager

exports.updateHubManager = async (req, res) => {
  const { user_id } = req.params;
  const { name, email } = req.body;

  try {
    await pool.query(
      `UPDATE hm_users
       SET name = $1, email = $2
       WHERE user_id = $3 AND role = 'Hub Manager'`,
      [name, email, user_id]
    );

    res.status(200).json({ message: "Hub Manager updated successfully" });
  } catch (error) {
    console.error("Error updating hub manager:", error);
    res.status(500).json({ error: "Failed to update hub manager" });
  }
};


// PUT: Reset Hub Manager Password

exports.resetHubManagerPassword = async (req, res) => {
  const { user_id } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE hm_users 
       SET password_hash = $1 
       WHERE user_id = $2 AND role = 'Hub Manager'`,
      [hashed, user_id]
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};
// GET: Count of Hub Managers
exports.getHubManagerCount = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS total_hub_managers
       FROM hm_users
       WHERE role = 'Hub Manager'`
    );

    res.status(200).json({ count: parseInt(result.rows[0].total_hub_managers, 10) });
  } catch (error) {
    console.error("Error counting hub managers:", error);
    res.status(500).json({ error: "Failed to count hub managers" });
  }
};

// POST: Login Hub Manager
exports.loginHubManager = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM hm_users WHERE email = $1 AND role = 'Hub Manager'`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hub Manager not found" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Optional: Add JWT token or session if needed
    res.status(200).json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};
