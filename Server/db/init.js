const db = require("../config/databaseCon"); // Import the database connection

db.serialize(() => {
  // Create users table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) console.error("Error creating users table", err);
      else console.log("Users table created or already exists.");
    }
  );

  // Create api_keys table with updated schema
  const createApiKeysTable = `
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      usage_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `;

  db.run(createApiKeysTable, (err) => {
    if (err) console.error("Error creating API keys table", err);
    else console.log("API keys table created or already exists.");
  });

  // Create api_key_usage_logs table for detailed request logging
  const createApiKeyUsageLogsTable = `
    CREATE TABLE IF NOT EXISTS api_key_usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_key_id INTEGER,
      endpoint TEXT NOT NULL,
      request_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      success BOOLEAN DEFAULT 1,
      FOREIGN KEY(api_key_id) REFERENCES api_keys(id)
    )
  `;

  db.run(createApiKeyUsageLogsTable, (err) => {
    if (err) console.error("Error creating API key usage logs table", err);
    else console.log("API key usage logs table created or already exists.");
  });

});

db.close((err) => {
  if (err) {
    console.error("Error closing the database connection", err);
  } else {
    console.log("Database initialization complete and connection closed.");
  }
});
