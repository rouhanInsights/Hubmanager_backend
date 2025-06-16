const express = require("express");
const router = express.Router();
const { getAllOrders, getOrderCount,getRecentOrders     } = require("../controllers/orderController");


router.get("/", getAllOrders);
router.get("/count", getOrderCount);
router.get("/recent", getRecentOrders);

module.exports = router;