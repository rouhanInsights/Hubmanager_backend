const express = require("express");
const {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", addCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;