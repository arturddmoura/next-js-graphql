const knex = require("knex");
const config = require("./knexfile");

const db = knex(config.development);

// BUG: no pooling limits, no error handling, reused connection not validated.
module.exports = db;
