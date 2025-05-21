const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductCount,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
  
} = require("../controllers/productController");

// GET all products
router.get("/", getAllProducts);

// GET total product count
router.get("/count", getProductCount);

// GET single product by ID
router.get("/:id", getProductById);

// POST new product
router.post("/", addProduct);

// PUT update product
router.put("/:id", updateProduct);

// DELETE product
router.delete("/:id", deleteProduct);



module.exports = router;