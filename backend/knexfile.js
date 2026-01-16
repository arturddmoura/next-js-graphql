module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || "taskuser",
      password: process.env.DB_PASSWORD || "123123",
      database: process.env.DB_NAME || "taskdb",
    },
    migrations: {
      directory: "./migrations",
    },
    seeds: {
      directory: "./seeds",
    },
    pool: {
      min: 2,
      max: 10,
    },
    debug: true,
    log: {
      warn: true,
      error: true,
      query: true,
    },
    acquireConnectionTimeout: 10000,
  },
};
