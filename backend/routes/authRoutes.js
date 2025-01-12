
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

module.exports = (db) => {
  // Define your auth routes here
  router.post('/register', authController.register);
  router.post('/login', authController.login);

  return router;
};