const express = require("express");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const knex = require("knex");
const cors = require("cors");
const fs = require('fs');
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const profileRoutes = require("./routes/profileRoutes"); // Import profile routes

const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const app = express();
const port = process.env.PORT || 5000;

// Verify that the environment variables are being correctly expanded
console.log('POSTGRES_URI:', process.env.POSTGRES_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET); // Verify that JWT_SECRET is loaded

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false,
      ca: fs.readFileSync(process.env.SSL_CERT_PATH).toString(),
    },
  }
});

// Test DB connection
const testDbConnection = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('Database connection successful');
  } catch (err) {
    console.error('Database connection failed:', err);
  }
};

testDbConnection();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}));
app.use(express.json()); // Built-in JSON parsing middleware

// Route setup
app.use("/api/auth", authRoutes(db)); // Passing the Knex DB instance to routes
app.use("/api/tasks", taskRoutes(db)); // Passing the Knex DB instance to routes
app.use("/api/profile", (req, res, next) => {
  console.log('Profile route accessed');
  next();
}, profileRoutes); // Add profile routes with logging

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message || err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});