const express = require("express");
const router = express.Router();
const { getAllOrders, getOrderCount } = require("../controllers/orderController");


router.get("/", getAllOrders);
router.get("/count", getOrderCount);

module.exports = router;