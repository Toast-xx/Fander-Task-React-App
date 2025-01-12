const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('Authorization Header:', authHeader); // Add logging

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Token:', token); // Add logging

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use the secret key from environment variable
    console.log('Decoded Token:', decoded); // Add logging
    req.user = decoded; // Attach the decoded token to the request object
    next();
  } catch (err) {
    console.error('Token verification error:', err); // Add logging
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authenticate;