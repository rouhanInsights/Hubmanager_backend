const pool = require("../config/db");
const { Parser } = require("json2csv");
const dayjs = require("dayjs");

const getMISReport = async (req, res) => {
  let { start_date, end_date, mode = "custom", download = false } = req.query;

  try {
    const today = dayjs();

    if (mode !== "custom") {
      end_date = today.format("YYYY-MM-DD");

      if (mode === "monthly") {
        start_date = today.subtract(1, "month").format("YYYY-MM-DD");
      } else if (mode === "quarterly") {
        start_date = today.subtract(3, "month").format("YYYY-MM-DD");
      } else if (mode === "yearly") {
        start_date = today.subtract(1, "year").format("YYYY-MM-DD");
      }
    }

    if (!start_date || !end_date) {
      return res.status(400).json({ error: "start_date and end_date are required" });
    }

    // Run all metrics in parallel
    const [
      orders,
      revenue,
      customers,
      categories,
      products,
      feedback,
      createdAccounts,
      statuses,
      payments,
      deliverySuccess,
      deliverySlots,
      daPerformance,
    ] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total_orders 
         FROM cust_orders 
         WHERE order_date BETWEEN $1 AND $2`,
        [start_date, end_date]
      ),
      pool.query(
        `SELECT SUM(total_price) AS gross_revenue 
         FROM cust_orders 
         WHERE order_date BETWEEN $1 AND $2`,
        [start_date, end_date]
      ),
      pool.query(
        `SELECT COUNT(DISTINCT user_id) AS active_customers 
         FROM cust_orders 
         WHERE order_date BETWEEN $1 AND $2`,
        [start_date, end_date]
      ),
      pool.query(
        `SELECT c.category_name, COUNT(*) AS order_count
         FROM cust_order_items oi
         JOIN cust_products p ON oi.product_id = p.product_id
         JOIN cust_categories c ON p.category_id = c.category_id
         JOIN cust_orders o ON oi.order_id = o.order_id
         WHERE o.order_date BETWEEN $1 AND $2
         GROUP BY c.category_name
         ORDER BY order_count DESC`,
        [start_date, end_date]
      ),
      pool.query(
        `SELECT p.name, COUNT(*) AS sold_count
         FROM cust_order_items oi
         JOIN cust_products p ON oi.product_id = p.product_id
         JOIN cust_orders o ON oi.order_id = o.order_id
         WHERE o.order_date BETWEEN $1 AND $2
         GROUP BY p.name
         ORDER BY sold_count DESC
         LIMIT 10`,
        [start_date, end_date]
      ),
      pool.query(
        `SELECT 
           COALESCE(AVG(rating_product), 0) AS avg_product_rating,
           COALESCE(AVG(rating_da), 0) AS avg_da_rating
         FROM cust_feedback
         WHERE feedback_date BETWEEN $1 AND $2`,
        [start_date, end_date]
      ),
      pool.query(
        `SELECT DATE(created_at) AS date, COUNT(*) AS count
         FROM cust_users
         WHERE created_at BETWEEN $1 AND $2
         GROUP BY date
         ORDER BY date`,
        [start_date, end_date]
      ),
      pool.query(
        `SELECT status, COUNT(*) AS count
         FROM cust_orders
         WHERE order_date BETWEEN $1 AND $2
         GROUP BY status`,
        [start_date, end_date]
      ),
      pool.query(
        `SELECT payment_method, COUNT(*) AS count
         FROM cust_orders
         WHERE order_date BETWEEN $1 AND $2
         GROUP BY payment_method`,
        [start_date, end_date]
      ),
      pool.query(
        `SELECT 
           ROUND(
             100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0),
             2
           ) AS delivery_success_rate
         FROM cust_orders
         WHERE order_date BETWEEN $1 AND $2`,
        [start_date, end_date]
      ),
      pool.query(
        `SELECT s.slot_details, COUNT(*) AS usage_count
         FROM cust_orders o
         JOIN cust_slot_details s ON o.slot_id = s.slot_id
         WHERE o.order_date BETWEEN $1 AND $2
         GROUP BY s.slot_details`,
        [start_date, end_date]
      ),
      pool.query(
        `SELECT 
           du.name, 
           COUNT(*) AS deliveries, 
           ROUND(AVG(cf.rating_da)::numeric,2) AS avg_rating
         FROM da_assigned_order dao
         JOIN da_users du ON dao.da_id = du.user_id
         LEFT JOIN cust_feedback cf ON cf.order_id = dao.assigned_order_id
         JOIN cust_orders o ON dao.assigned_order_id = o.order_id
         WHERE o.order_date BETWEEN $1 AND $2
         GROUP BY du.name
         ORDER BY deliveries DESC`,
        [start_date, end_date]
      ),
    ]);

    const report = {
      period: { start_date, end_date, mode },
      total_orders: +orders.rows[0].total_orders,
      gross_revenue: +revenue.rows[0].gross_revenue || 0,
      active_customers: +customers.rows[0].active_customers,
      category_sales: categories.rows,
      top_products: products.rows,
      feedback_summary: {
        avg_product_rating: parseFloat(feedback.rows[0]?.avg_product_rating || 0),
        avg_da_rating: parseFloat(feedback.rows[0]?.avg_da_rating || 0),
      },
      account_creation_trends: createdAccounts.rows,
      order_statuses: statuses.rows,
      payment_modes: payments.rows,
      delivery_success_rate: +deliverySuccess.rows[0].delivery_success_rate || 0,
      delivery_slot_utilization: deliverySlots.rows,
      delivery_agent_performance: daPerformance.rows,
    };

    if (download === "csv") {
      const parser = new Parser();
      const csv = parser.parse(report);
      res.header("Content-Type", "text/csv");
      res.attachment(`MIS_Report_${start_date}_to_${end_date}.csv`);
      return res.send(csv);
    }

    return res.json(report);
  } catch (err) {
    console.error("❌ MIS report error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getMISReport };
