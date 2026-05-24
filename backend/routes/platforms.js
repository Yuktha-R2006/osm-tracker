const express = require('express');
const router = express.Router();
const { getPlatforms, getAllPlatforms, createPlatform, updatePlatform, deletePlatform, uploadLogo } = require('../controllers/platformController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getPlatforms);
router.get('/all', protect, admin, getAllPlatforms);
router.post('/', protect, admin, createPlatform);
router.put('/upload-logo', protect, admin, uploadLogo);
router.put('/:id', protect, admin, updatePlatform);
router.put('/:id/logo', protect, admin, uploadLogo);
router.delete('/:id', protect, admin, deletePlatform);

module.exports = router;
