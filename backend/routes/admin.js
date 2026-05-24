const express = require('express');
const router = express.Router();
const { getStats, getUsers, deleteUser, getUserDetails, toggleUserStatus, updateUser, runBillingCron } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getStats);
router.get('/users', protect, admin, getUsers);
router.get('/users/:id', protect, admin, getUserDetails);
router.put('/users/:id', protect, admin, updateUser);
router.delete('/users/:id', protect, admin, deleteUser);
router.patch('/users/:id/status', protect, admin, toggleUserStatus);
router.post('/run-cron', protect, admin, runBillingCron);

module.exports = router;
