
const express = require("express");
const router = express.Router();
const {
  getAllPayments,
  getPaymentByOrderId,
  getPaymentCount
} = require("../controllers/paymentController");

router.get("/count", getPaymentCount);
router.get("/", getAllPayments);              // GET /api/payments
router.get("/:orderId", getPaymentByOrderId); // GET /api/payments/123


module.exports = router;