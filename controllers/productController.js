const pool = require("../config/db");

// GET all products
const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.category_name
      FROM cust_products p
      LEFT JOIN cust_categories c ON p.category_id = c.category_id
      ORDER BY product_id ASC
    `);
    res.json({ products: result.rows });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET single product by ID
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM cust_products WHERE product_id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST - Add a new product
const addProduct = async (req, res) => {
  const {
    name, description, price, stock_quantity,
    category_id, image_url, sale_price,
    product_published, product_featured, product_visibility,
    product_short_description, product_tax, product_stock_available, weight
  } = req.body;

  try {
    const result = await pool.query(
      `WITH max_id AS (
  SELECT MAX(product_id) + 1 AS next_id
  FROM cust_products
)
INSERT INTO cust_products (
    product_id, name, description, price, stock_quantity, category_id, image_url,
    sale_price, product_published, product_featured, product_visibility,
    product_short_description, product_tax, product_stock_available, weight
)
SELECT next_id, $1, $2, $3, $4, $5, $6,
       $7, $8, $9, $10, $11, $12, $13, $14
FROM max_id
RETURNING *`,
      [
        name, description, price, stock_quantity, category_id, image_url,
        sale_price, product_published, product_featured, product_visibility,
        product_short_description, product_tax, product_stock_available, weight
      ]
    );
    res.status(201).json({ message: "Product added", product: result.rows[0] });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT - Update existing product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name, description, price, stock_quantity,
    category_id, image_url, sale_price,
    product_published, product_featured, product_visibility,
    product_short_description, product_tax, product_stock_available, weight
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE cust_products SET
        name = $1,
        description = $2,
        price = $3,
        stock_quantity = $4,
        category_id = $5,
        image_url = $6,
        sale_price = $7,
        product_published = $8,
        product_featured = $9,
        product_visibility = $10,
        product_short_description = $11,
        product_tax = $12,
        product_stock_available = $13,
        weight = $14
      WHERE product_id = $15
      RETURNING *`,
      [
        name, description, price, stock_quantity,
        category_id, image_url, sale_price,
        product_published, product_featured, product_visibility,
        product_short_description, product_tax, product_stock_available, weight,
        id
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product updated", product: result.rows[0] });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE - Remove a product
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM cust_products WHERE product_id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted", product: result.rows[0] });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET - Total product count
const getProductCount = async (req, res) => {
  try {
    const result = await pool.query(`SELECT COUNT(*) FROM cust_products`);
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error("Error fetching product count:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
// PATCh - Update  product stock
const updateStock = async (req, res) => {
  const { id } = req.params;
  const { stock_quantity, product_stock_available } = req.body;

  if (stock_quantity === undefined && product_stock_available === undefined) {
    return res.status(400).json({ error: "No stock fields provided" });
  }

  try {
    const result = await pool.query(
      `UPDATE cust_products
       SET stock_quantity = COALESCE($1, stock_quantity),
           product_stock_available = COALESCE($2, product_stock_available)
       WHERE product_id = $3
       RETURNING *`,
      [stock_quantity, product_stock_available, id]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error updating stock:", err.message);
    res.status(500).json({ error: "Failed to update stock" });
  }
};


module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductCount,
  updateStock
};
