const pool = require('../config/db');

// Get all delivery agents
const getAllAgents = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM da_users ORDER BY created_at DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching agents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Count agents by status
const countAgents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
      FROM da_users
    `);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error counting agents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Approve/reject agent
const updateAgentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    await pool.query("UPDATE da_users SET status = $1 WHERE user_id = $2", [status, id]);
    res.status(200).json({ message: 'Agent status updated to ${status}' });
  } catch (err) {
    console.error("Error updating agent status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update availability
const updateAvailability = async (req, res) => {
  const { id } = req.params;
  const { available } = req.body;

  try {
    await pool.query("UPDATE da_users SET availability = $1 WHERE user_id = $2", [available, id]);
    res.status(200).json({ message:' Availability updated to ${available}' });
  } catch (err) {
    console.error("Error updating availability:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Get all delivery slots
const getaApprovedAgents = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM da_users WHERE status = 'approved' ORDER BY created_at DESC");

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching agents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Count only approved delivery agents
const countApprovedAgents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) AS approved_count
      FROM da_users
      WHERE status = 'approved'
    `);
    res.status(200).json({ count: parseInt(result.rows[0].approved_count, 10) });
  } catch (err) {
    console.error("Error counting approved agents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
  getAllAgents,
  countAgents,
  updateAgentStatus,
  updateAvailability,
  getaApprovedAgents,
  countApprovedAgents
};