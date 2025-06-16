
const express = require("express");
const router = express.Router();
const {
  getAllPayments,
  getPaymentByOrderId,
} = require("../controllers/paymentController");

router.get("/", getAllPayments);              // GET /api/payments
router.get("/:orderId", getPaymentByOrderId); // GET /api/payments/123

module.exports = router;