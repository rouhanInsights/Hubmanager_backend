const express = require('express');
const router = express.Router();
const { getFeedbackList } = require('../controllers/feedbackController');

// GET /api/feedback
router.get('/', getFeedbackList);

module.exports = router;
