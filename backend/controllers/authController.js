// Import necessary modules
const bcrypt = require('bcrypt'); // Library for hashing and verifying passwords
const jwt = require('jsonwebtoken'); // Library for generating and verifying JSON Web Tokens
const knex = require('../db'); // Import the database connection/configuration

// Function to handle user registration
const register = async (req, res) => {
  // Extract required fields from the request body
  const { firstName, lastName, email, password } = req.body;

  // Log the received data for debugging purposes
  console.log('Received data for registration:', { firstName, lastName, email, password });

  // Check if all required fields are provided
  if (!firstName || !lastName || !email || !password) {
    console.log('Registration failed: Missing fields');
    return res.status(400).json({ message: 'All fields are required' }); // Return error if any field is missing
  }

  try {
    // Check if a user with the same email already exists in the database
    const existingUser = await knex('users').where({ email }).first();
    if (existingUser) {
      console.log('Registration failed: Email already in use');
      return res.status(400).json({ message: 'Email already in use' }); // Return error if email is already taken
    }

    // Hash the user's password for secure storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const newUser = await knex('users')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        password: hashedPassword,
      })
      .returning('*'); // Return the newly created user

    // Log success and send a response with the user ID
    console.log('User registered successfully:', newUser[0]);
    res.status(201).json({ message: 'User registered successfully', userId: newUser[0].id });
  } catch (err) {
    // Handle any errors that occur during the registration process
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Function to handle user login
const login = async (req, res) => {
  // Extract required fields from the request body
  const { email, password } = req.body;

  // Log the received data for debugging purposes
  console.log('Received data for login:', { email, password });

  try {
    // Check if a user with the provided email exists in the database
    const user = await knex('users').where({ email }).first();
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(404).json({ message: 'User not found' }); // Return error if user does not exist
    }

    // Verify the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({ message: 'Invalid password' }); // Return error if password is incorrect
    }

    // Generate a JSON Web Token (JWT) for the authenticated user
    const token = jwt.sign(
      { userId: user.id, email: user.email }, // Payload with user data
      process.env.JWT_SECRET, // Secret key for signing the token
      { expiresIn: '1h' } // Token expiration time
    );

    // Log success and send a response with the token
    console.log('Login successful, token generated:', token);
    res.status(200).json({ message: 'Login successful', token }); // Ensure token is included in the response
  } catch (err) {
    // Handle any errors that occur during the login process
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Export the functions to make them available for other files
module.exports = { register, login };
