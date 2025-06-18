//paymentController.js

const pool = require("../config/db");

// Get all payments (order_id, total_price, payment_method)
const getAllPayments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT order_id, total_price, payment_method 
      FROM cust_orders 
      ORDER BY order_date DESC
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get payment by order_id
const getPaymentByOrderId = async (req, res) => {
  const { orderId } = req.params;

  try {
    const result = await pool.query(
      `SELECT order_id, total_price, payment_method 
       FROM cust_orders 
       WHERE order_id = $1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching payment by ID:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Get total number of payments
const getPaymentCount = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) AS total_payments
      FROM cust_orders
      WHERE payment_method IS NOT NULL
    `);

    res.status(200).json({ count: parseInt(result.rows[0].total_payments, 10) });
  } catch (err) {
    console.error("Error counting payments:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = {
  getAllPayments,
  getPaymentByOrderId,
  getPaymentCount,

};