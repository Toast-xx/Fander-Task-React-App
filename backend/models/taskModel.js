// models/taskModel.js
const db = require('./index'); // Import Knex instance

// Define task model
const Task = {
  // Create a new task
  create: (task) => {
    return db('tasks').insert(task).returning('*'); // Insert task into 'tasks' table
  },

  // Get all tasks
  getAll: (boardId) => {
    return db('tasks').where('boardId', boardId).where('isDeleted', false); // Get tasks by boardId
  },

  // Get a single task by ID
  getById: (taskId) => {
    return db('tasks').where('id', taskId).first(); // Get task by ID
  },

  // Update a task by ID
  update: (taskId, updates) => {
    return db('tasks').where('id', taskId).update(updates).returning('*'); // Update task
  },

  // Delete a task by ID
  delete: (taskId) => {
    return db('tasks').where('id', taskId).update({ isDeleted: true }).returning('*'); // Soft delete task
  },
};

module.exports = Task;
