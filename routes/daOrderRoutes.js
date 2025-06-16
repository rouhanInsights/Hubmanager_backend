//daOrderRoutes.js

const express = require('express');
const router = express.Router();
const {
  getAllAssignedOrders,
  getUnassignedOrders,
  assignOrder, getAssignableOrders,
  getAssignedOrders,getAssignMultiple
} = require('../controllers/daOrderController');

router.get('/', getAllAssignedOrders);
router.get('/unassigned', getUnassignedOrders);
router.post('/assign', assignOrder);
router.get('/assignable', getAssignableOrders);
router.get('/assigned', getAssignedOrders);
router.post('/assign-multiple', getAssignMultiple);


module.exports = router;