const pool = require("../config/db");

// GET feedback list with customer & DA names
const getFeedbackList = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        f.feedback_id,
        f.order_id,
        f.user_id,
        f.rating_product,
        f.rating_da,
        f.comment_product,
        f.comment_da,
        f.feedback_date,

        cu.name AS customer_name,
        cu.phone AS customer_phone,

        du.name AS da_name

      FROM cust_feedback f
      JOIN cust_users cu ON f.user_id = cu.user_id
      JOIN cust_orders o ON f.order_id = o.order_id
      LEFT JOIN da_assigned_order dao ON dao.assigned_order_id = o.order_id
      LEFT JOIN da_users du ON du.user_id = dao.da_id

      ORDER BY f.feedback_date DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching enriched feedback list:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getFeedbackList,
};
