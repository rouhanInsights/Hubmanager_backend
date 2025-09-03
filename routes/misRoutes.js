const express = require("express");
const router = express.Router();
const { getMISReport } = require("../controllers/misController");

// GET /api/mis-report?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&mode=monthly&download=csv
router.get("/", getMISReport);

module.exports = router;
