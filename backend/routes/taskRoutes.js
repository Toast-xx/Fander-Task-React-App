const express = require('express');
const multer = require('multer');
const authenticate = require('../middleware/authenticate'); // Import the authenticate middleware
const taskController = require('../controllers/taskController'); // Import the task controller

const router = express.Router();

// Multer setup for image file upload
const upload = multer({ dest: 'uploads/' }); // Save images to the 'uploads' folder

module.exports = (db) => {
  router.use(authenticate); // Apply the middleware to all task routes

  // Fetch all tasks
  router.get('/', (req, res) => taskController.getAllTasks(req, res, db));

  // Create a new task
  router.post('/', upload.single('image'), (req, res) => taskController.createTask(req, res, db));

  // Update an existing task
  router.put('/:id', upload.single('image'), (req, res) => taskController.updateTask(req, res, db));

  // Delete a task
  router.delete('/:id', (req, res) => taskController.deleteTask(req, res, db));

  // Mark a task as complete
  router.patch('/:id/complete', (req, res) => taskController.markTaskAsComplete(req, res, db));

  // Fetch task progress
  router.get('/progress', (req, res) => taskController.getTaskProgress(req, res, db));

  // Add reflection to a task
  router.post('/:id/reflection', (req, res) => taskController.addReflection(req, res, db));

  // Fetch reflection history
  router.get('/reflection-history', (req, res) => taskController.getReflectionHistory(req, res, db));

  return router;
};