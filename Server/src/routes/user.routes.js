// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { upload, uploadToCloudinary } = require('../utils/upload');

// All user routes are protected
router.use(authenticateJWT);

router.put('/profile/edit', upload, uploadToCloudinary, userController.editProfile);
router.get('/profile', userController.getProfile);
router.get('/profile/:username', userController.getProfileByUsername);
router.get('/all', userController.getAllUsers);

module.exports = router;
