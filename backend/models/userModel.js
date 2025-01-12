const db = require('./index'); // Import Knex instance

// Define user model
const User = {
  // Create a new user
  create: (user) => {
    console.log('Creating user:', user);
    return db('users').insert(user).returning('*'); // Insert user into 'users' table
  },

  // Get a user by email
  getByEmail: (email) => {
    console.log('Getting user by email:', email);
    return db('users').where('email', email).first(); // Get user by email
  },

  // Get a user by ID
  getById: (userId) => {
    console.log('Getting user by ID:', userId);
    return db('users').where('id', userId).first(); // Get user by ID
  },

  // Update a user's profile
  update: (userId, updates) => {
    console.log('Updating user ID:', userId, 'with updates:', updates);
    return db('users').where('id', userId).update(updates).returning('*'); // Update user profile
  },

  // Update a user's password
  updatePassword: (userId, newPassword) => {
    console.log('Updating password for user ID:', userId);
    return db('users').where('id', userId).update({ password: newPassword }).returning('*'); // Update password
  },
};

module.exports = User;