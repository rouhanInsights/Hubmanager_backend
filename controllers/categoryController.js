const pool = require("../config/db");

// GET all categories
const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cust_categories ORDER BY category_id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET a category by ID
const getCategoryById = async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid category ID" });
  }

  try {
    const result = await pool.query("SELECT * FROM cust_categories WHERE category_id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST - Create new category
const addCategory = async (req, res) => {
  const { category_name } = req.body;

  if (!category_name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO cust_categories (category_name) VALUES ($1) RETURNING *",
      [category_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT - Update category
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { category_name } = req.body;

  if (!category_name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const result = await pool.query(
      "UPDATE cust_categories SET category_name = $1 WHERE category_id = $2 RETURNING *",
      [category_name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE - Remove category
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM cust_categories WHERE category_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ message: "Category deleted", deleted: result.rows[0] });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
};