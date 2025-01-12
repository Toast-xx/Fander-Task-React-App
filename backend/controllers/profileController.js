const jwt = require('jsonwebtoken');
const User = require("../models/userModel"); // Ensure this path is correct
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const knex = require('../db'); // Import Knex for database queries

// Middleware to authenticate and decode the token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']; // Get the authorization header from the request
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the header
  if (!token) {
    console.log('Authentication failed: No token provided'); // Log failure due to missing token
    return res.sendStatus(401); // Return Unauthorized status
  }

  // Verify the token using the secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Authentication failed: Invalid token'); // Log failure due to invalid token
      return res.sendStatus(403); // Return Forbidden status
    }
    req.user = user; // Attach the user data to the request
    console.log('Token verified, user authenticated:', user); // Log successful authentication
    next(); // Proceed to the next middleware
  });
};

// Get profile
exports.getProfile = [authenticateToken, async (req, res) => {
  const { userId } = req.user; // Extract userId from the decoded token
  console.log('Fetching profile for user ID:', userId); // Log the operation

  try {
    const user = await User.getById(userId); // Fetch user by ID from the database
    if (!user) {
      console.log('Profile fetch failed: User not found'); // Log failure if user is not found
      return res.status(404).json({ message: "User not found" }); // Return Not Found status
    }

    // Exclude sensitive data like password from the response
    const { password, ...userProfile } = user;
    console.log('Profile fetched successfully:', userProfile); // Log successful fetch
    res.json(userProfile); // Send the user profile in the response
  } catch (err) {
    console.error('Error fetching profile:', err); // Log any error during the fetch
    res.status(500).json({ message: "Server error" }); // Return Internal Server Error status
  }
}];

// Update profile
exports.updateProfile = [authenticateToken, async (req, res) => {
  const { userId } = req.user; // Extract userId from the decoded token
  const { firstName, lastName, email, currentPassword, newPassword } = req.body; // Extract data from the request body

  console.log('Updating profile for user ID:', userId, 'with data:', { firstName, lastName, email, currentPassword, newPassword }); // Log the operation

  // Basic validation for required fields
  if (!firstName || !lastName || !email) {
    console.log('Profile update failed: Missing firstName, lastName, or email'); // Log missing fields
    return res.status(400).json({ message: "First name, last name, and email are required" }); // Return Bad Request status
  }

  try {
    const user = await User.getById(userId); // Fetch user by ID
    console.log('User fetched for update:', user); // Log fetched user
    if (!user) {
      console.log('Profile update failed: User not found'); // Log failure if user is not found
      return res.status(404).json({ message: "User not found" }); // Return Not Found status
    }

    // Ensure email is unique
    const existingUser = await User.getByEmail(email); // Check if email already exists
    console.log('Existing user with email:', existingUser); // Log existing user with the same email
    if (existingUser && existingUser.id !== parseInt(userId)) {
      console.log('Profile update failed: Email already taken'); // Log email conflict
      return res.status(400).json({ message: "Email is already taken" }); // Return Bad Request status
    }

    const updateData = { first_name: firstName, last_name: lastName, email }; // Prepare data for update

    // If new password is provided, verify current password and hash new password
    if (newPassword) {
      if (!currentPassword) {
        console.log('Profile update failed: Current password required for password change'); // Log missing current password
        return res.status(400).json({ message: "Current password is required to change the password" }); // Return Bad Request status
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password); // Verify current password
      console.log('Is current password valid:', isPasswordValid); // Log password verification result
      if (!isPasswordValid) {
        console.log('Profile update failed: Current password incorrect'); // Log invalid current password
        return res.status(400).json({ message: "Current password is incorrect" }); // Return Bad Request status
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash the new password
      updateData.password = hashedPassword; // Add hashed password to the update data
    }

    console.log('Update data:', updateData); // Log data to be updated

    const updatedUser = await User.update(userId, updateData); // Update user in the database
    console.log('Updated user:', updatedUser); // Log updated user

    if (!updatedUser) {
      console.log('Profile update failed: User not found'); // Log failure if update is unsuccessful
      return res.status(404).json({ message: "User not found" }); // Return Not Found status
    }

    // Exclude sensitive data like password from the response
    const { password, ...updatedUserProfile } = updatedUser[0];
    console.log('Profile updated successfully:', updatedUserProfile); // Log successful update
    res.json({ message: "Profile updated successfully", user: updatedUserProfile }); // Send response with updated profile
  } catch (err) {
    console.error('Error updating profile:', err); // Log any error during the update
    res.status(500).json({ message: "Server error" }); // Return Internal Server Error status
  }
}];
