
const express = require('express');
const router = express.Router();
const {
  getAllAgents,
  countAgents,
  updateAgentStatus,
  updateAvailability,
  getaApprovedAgents
} = require('../controllers/daController');

router.get('/', getAllAgents);
router.get('/count', countAgents);
router.put('/:id/status', updateAgentStatus);
router.get('/approved', getaApprovedAgents);
router.put('/:id/availability', updateAvailability);


module.exports = router;