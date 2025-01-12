const knex = require("knex");
const knexConfig = require("./knexfile"); // Import the knexfile.js for configuration

// Initialize Knex using the appropriate environment settings from knexfile.js
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];
if (!config) {
  throw new Error(`Knex configuration for environment '${environment}' is missing`);
}
const db = knex(config);

module.exports = db;