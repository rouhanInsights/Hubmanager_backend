//custRoutes.js

const express = require("express");
const router = express.Router();
const {
  getAllCustomers,
  getCustomerOrders,
  getCustomerCount,
} = require("../controllers/custController");

router.get("/", getAllCustomers);
router.get("/orders", getCustomerOrders);
router.get("/count",getCustomerCount  );

module.exports = router;
