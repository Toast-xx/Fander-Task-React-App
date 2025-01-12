const express = require('express');
const profileController = require('../controllers/profileController');
const authenticate = require('../middleware/authenticate'); // Import the authenticate middleware

const router = express.Router();

router.use(authenticate); // Apply the middleware to all profile routes

// Fetch user profile
router.get('/', profileController.getProfile);

// Update user profile
router.put('/', profileController.updateProfile);

module.exports = router;