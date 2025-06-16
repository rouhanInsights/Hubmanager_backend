const pool = require('../config/db');

// Get all assigned orders with DA name
const getAllAssignedOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        dao.*, 
        du.name AS da_name
      FROM da_assigned_order dao
      JOIN da_users du ON dao.da_id = du.user_id
      ORDER BY dao.assigned_id DESC
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching assigned orders:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all unassigned orders for dropdown
const getUnassignedOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        co.order_id,
        co.address_id,
        co.slot_id,
        CONCAT_WS(', ', a.address_line1, a.address_line2, a.city, a.pincode) AS full_address,
        cs.slot_details
      FROM cust_orders co
      JOIN cust_addresses a ON co.address_id = a.address_id
      JOIN cust_slot_details cs ON co.slot_id = cs.slot_id
      WHERE co.order_id NOT IN (SELECT assigned_order_id FROM da_assigned_order)
      ORDER BY co.order_date DESC
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching unassigned orders:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Assign one order to a DA
const assignOrder = async (req, res) => {
  const { da_id, order_id, remarks } = req.body;

  try {
    const orderInfo = await pool.query(`
      SELECT 
        co.slot_id,
        cs.slot_details,
        a.address_line1,
        a.address_line2,
        a.city,
        a.pincode
      FROM cust_orders co
      JOIN cust_addresses a ON co.address_id = a.address_id
      JOIN cust_slot_details cs ON co.slot_id = cs.slot_id
      WHERE co.order_id = $1
    `, [order_id]);

    if (orderInfo.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderInfo.rows[0];
    const full_address = `${order.address_line1}, ${order.address_line2}, ${order.city}, ${order.pincode}`;
    const slot_details = order.slot_details;

    await pool.query(`
      INSERT INTO da_assigned_order (
        da_id, assigned_slot_details, assigned_order_id,
        assigned_order_address, order_status, remarks
      ) VALUES ($1, $2, $3, $4, 'assigned', $5)
    `, [da_id, slot_details, order_id, full_address, remarks || null]);

    res.status(201).json({ message: "Order assigned successfully" });
  } catch (err) {
    console.error("Error assigning order:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Fetch assignable orders (not already assigned to any delivery agent)
const getAssignableOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.order_id,
        CONCAT_WS(', ',
          a.address_line1,
          a.address_line2,
          a.city,
          a.state,
          a.pincode
        ) AS full_address,
        s.slot_details
      FROM cust_orders o
      JOIN cust_addresses a ON o.address_id = a.address_id
      JOIN cust_slot_details s ON o.slot_id = s.slot_id
      WHERE o.order_id NOT IN (
        SELECT assigned_order_id FROM da_assigned_order
        WHERE order_status IN ('assigned', 'accepted')
      )
      ORDER BY o.order_date DESC
    `);

    res.status(200).json({ orders: result.rows });
  } catch (err) {
    console.error("Error fetching assignable orders:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all assigned orders
const getAssignedOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.assigned_id,
        d.assigned_order_id AS order_id,
        u.name AS agent_name,
        d.assigned_order_address AS full_address,
        d.assigned_slot_details AS slot_details,
        d.order_status,
        d.remarks
      FROM da_assigned_order d
      JOIN da_users u ON d.da_id = u.user_id
      ORDER BY d.assigned_id DESC
    `);
    res.status(200).json({ orders: result.rows });
  } catch (err) {
    console.error("Error fetching assigned orders:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Assign multiple orders to a DA
const getAssignMultiple = async (req, res) => {
  const { da_id, order_ids } = req.body;

  if (!da_id || !Array.isArray(order_ids) || order_ids.length === 0) {
    return res.status(400).json({ error: "Missing agent or orders" });
  }

  try {
    // Fetch address and slot for each order
    const ordersQuery = await pool.query(`
      SELECT 
        o.order_id,
        CONCAT_WS(', ', a.address_line1, a.address_line2, a.city, a.state, a.pincode) AS full_address,
        s.slot_details
      FROM cust_orders o
      JOIN cust_addresses a ON o.address_id = a.address_id
      JOIN cust_slot_details s ON o.slot_id = s.slot_id
      WHERE o.order_id = ANY($1::int[])
    `, [order_ids]);

    const insertPromises = ordersQuery.rows.map(order => {
      return pool.query(`
        INSERT INTO da_assigned_order (
          da_id, assigned_order_id, assigned_order_address,
          assigned_slot_details, order_status
        )
        VALUES ($1, $2, $3, $4, 'assigned')
        ON CONFLICT (assigned_order_id) DO NOTHING
      `, [da_id, order.order_id, order.full_address, order.slot_details]);
    });

    await Promise.all(insertPromises);
    res.status(200).json({ success: true, message: "Orders assigned" });
  } catch (err) {
    console.error("Error assigning orders:", err);
    res.status(500).json({ error: "Failed to assign orders" });
  }
};

module.exports = {
  getAllAssignedOrders,
  getUnassignedOrders,
  assignOrder,
  getAssignableOrders,
  getAssignedOrders,
  getAssignMultiple
};
