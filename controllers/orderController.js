const pool = require("../config/db");
const { get } = require("../routes/orderRoutes");

const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
  o.order_id,
  o.order_date,
  o.slot_date,
  s.slot_details,
  o.status,
  o.total_price,
  o.payment_method,
  u.name AS customer_name,
  u.phone,
  CONCAT_WS(', ', a.address_line1, a.address_line2, a.city, a.state, a.pincode) AS full_address,
  ARRAY_AGG(p.name || ' (x' || i.quantity || ')') AS product_details
FROM cust_orders o
JOIN cust_users u ON o.user_id = u.user_id
JOIN cust_addresses a ON o.address_id = a.address_id
JOIN cust_order_items i ON o.order_id = i.order_id
JOIN cust_products p ON i.product_id = p.product_id
JOIN cust_slot_details s ON o.slot_id = s.slot_id
GROUP BY
  o.order_id, o.order_date, o.slot_date, s.slot_details,
  o.status, o.total_price, o.payment_method,
  u.name, u.phone,
  a.address_line1, a.address_line2, a.city, a.state, a.pincode
ORDER BY o.order_date DESC;

    `);

    res.status(200).json({ orders: result.rows });
  } catch (error) {
    console.error("❌ SQL Query Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getOrderCount = async (req, res) => {
  try {
    const result = await pool.query(`SELECT COUNT(*) FROM cust_orders`);
    res.status(200).json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error("Error fetching order count:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getRecentOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.name AS customer_name,
        p.name AS product_name,
        oi.price
      FROM cust_orders o
      JOIN cust_users u ON o.user_id = u.user_id
      JOIN cust_order_items oi ON o.order_id = oi.order_id
      JOIN cust_products p ON oi.product_id = p.product_id
      ORDER BY o.order_date DESC
      LIMIT 5
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching recent orders:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
  getAllOrders,
  getOrderCount,
  getRecentOrders,
};