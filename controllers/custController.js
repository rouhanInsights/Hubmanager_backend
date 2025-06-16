const pool = require("../config/db");

// Fetch all customers
const getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cust_users ORDER BY created_at DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Fetch customers and their orders with full addresses
const getCustomerOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        o.order_id,
        o.order_date,
        o.total_price,
        CONCAT_WS(', ', addr.address_line1, addr.address_line2, addr.city, addr.state, addr.pincode) AS full_address,
        STRING_AGG(p.name || ' (x' || oi.quantity || ')', ', ') AS product_details
      FROM cust_users u
      LEFT JOIN cust_orders o ON u.user_id = o.user_id
      LEFT JOIN cust_addresses addr ON o.address_id = addr.address_id
      LEFT JOIN cust_order_items oi ON o.order_id = oi.order_id
      LEFT JOIN cust_products p ON oi.product_id = p.product_id
      GROUP BY u.user_id, u.name, u.email, u.phone, o.order_id, o.order_date, o.total_price, addr.address_line1, addr.address_line2, addr.city, addr.state, addr.pincode
      ORDER BY u.user_id, o.order_date DESC;
    `);

    const grouped = {};

    for (const row of result.rows) {
      if (!grouped[row.user_id]) {
        grouped[row.user_id] = {
          user_id: row.user_id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          address_orders: {}  // { address: [orders] }
        };
      }

      const address = row.full_address || "Unknown Address";

      if (!grouped[row.user_id].address_orders[address]) {
        grouped[row.user_id].address_orders[address] = [];
      }

      grouped[row.user_id].address_orders[address].push({
        order_id: row.order_id,
        order_date: row.order_date,
        product_details: row.product_details,
        total_price: row.total_price,
      });
    }

    const customers = Object.values(grouped);
    res.status(200).json(customers);
  } catch (err) {
    console.error("Error grouping customer orders:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Count total customers
const getCustomerCount = async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM cust_users");
    res.status(200).json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error("Error counting customers:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerOrders,
  getCustomerCount
};
