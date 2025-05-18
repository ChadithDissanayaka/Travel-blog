// db/init.js
const db = require("../config/databaseCon"); // Import the database connection

db.serialize(() => {
  // Create the users table
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,         -- Unique ID for the user (auto-incremented)
      username TEXT UNIQUE NOT NULL,                -- Username (must be unique)
      email TEXT UNIQUE NOT NULL,                   -- User's email (must be unique)
      password TEXT NOT NULL,                       -- User's password (hashed)
      address TEXT,                                 -- Optional: User's address
      description TEXT,                             -- Optional: Short description about the user
      profile_picture TEXT,                         -- Optional: Path to profile picture
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- Timestamp when the user was created
    )`,
    (err) => {
      if (err) {
        console.error("Error creating users table", err);
      } else {
        console.log("Users table created or already exists.");
      }
    }
  );

  // Create the blog_posts table
  db.run(
    `CREATE TABLE IF NOT EXISTS blog_posts (
      post_id INTEGER PRIMARY KEY AUTOINCREMENT,      -- Unique ID for the post
      user_id INTEGER,                                -- ID of the user who created the post (foreign key)
      title TEXT NOT NULL,                            -- Title of the post
      content TEXT NOT NULL,                          -- Content of the post
      country_name TEXT NOT NULL,                     -- Country where the post is related
      date_of_visit DATE NOT NULL,                    -- Date of visit
      image TEXT,                                     -- Optional: Path to blog post image
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the post was created
      FOREIGN KEY(user_id) REFERENCES users(id)      -- Foreign key reference to the users table
    )`,
    (err) => {
      if (err) {
        console.error("Error creating blog_posts table", err);
      } else {
        console.log("Blog posts table created or already exists.");
      }
    }
  );

  // Create the comments table
  db.run(
    `CREATE TABLE IF NOT EXISTS comments (
      comment_id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Unique ID for the comment
      post_id INTEGER,                                -- ID of the post the comment belongs to (foreign key)
      user_id INTEGER,                                -- ID of the user who created the comment (foreign key)
      comment_text TEXT NOT NULL,                     -- Content of the comment
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the comment was created
      FOREIGN KEY(post_id) REFERENCES blog_posts(post_id),  -- Foreign key reference to the blog_posts table
      FOREIGN KEY(user_id) REFERENCES users(id)      -- Foreign key reference to the users table
    )`,
    (err) => {
      if (err) {
        console.error("Error creating comments table", err);
      } else {
        console.log("Comments table created or already exists.");
      }
    }
  );

  // Create the likes table
  db.run(
    `CREATE TABLE IF NOT EXISTS likes (
      like_id INTEGER PRIMARY KEY AUTOINCREMENT,      -- Unique ID for the like/dislike
      post_id INTEGER,                                -- ID of the post that was liked/disliked (foreign key)
      user_id INTEGER,                                -- ID of the user who liked/disliked the post (foreign key)
      is_like BOOLEAN NOT NULL,                       -- Whether the action was a like (true) or a dislike (false)
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the like/dislike was made
      FOREIGN KEY(post_id) REFERENCES blog_posts(post_id),  -- Foreign key reference to the blog_posts table
      FOREIGN KEY(user_id) REFERENCES users(id)      -- Foreign key reference to the users table
    )`,
    (err) => {
      if (err) {
        console.error("Error creating likes table", err);
      } else {
        console.log("Likes table created or already exists.");
      }
    }
  );

  // Create the followers table
  db.run(
    `CREATE TABLE IF NOT EXISTS followers (
      follower_id INTEGER,                           -- ID of the user who is following (foreign key)
      following_id INTEGER,                          -- ID of the user being followed (foreign key)
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the following was created
      PRIMARY KEY(follower_id, following_id),       -- Composite primary key (follower and following)
      FOREIGN KEY(follower_id) REFERENCES users(id), -- Foreign key reference to the users table
      FOREIGN KEY(following_id) REFERENCES users(id)  -- Foreign key reference to the users table
    )`,
    (err) => {
      if (err) {
        console.error("Error creating followers table", err);
      } else {
        console.log("Followers table created or already exists.");
      }
    }
  );

  // Create the API keys table
  db.run(
    `CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,        -- Unique ID for the API key
      key TEXT UNIQUE NOT NULL,                     -- The API key itself
      user_id INTEGER,                              -- ID of the user who owns the API key (foreign key)
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the API key was created
      usage_count INTEGER DEFAULT 0,                -- Number of times the API key has been used
      is_active BOOLEAN DEFAULT 1,                  -- Whether the API key is active (1) or inactive (0)
      FOREIGN KEY(user_id) REFERENCES users(id)    -- Foreign key reference to the users table
    )`,
    (err) => {
      if (err) {
        console.error("Error creating API keys table", err);
      } else {
        console.log("API keys table created or already exists.");
      }
    }
  );

  // Create the API key usage logs table
  db.run(
    `CREATE TABLE IF NOT EXISTS api_key_usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,            -- Unique ID for the log entry
      api_key_id INTEGER,                              -- ID of the API key used (foreign key)
      endpoint TEXT NOT NULL,                           -- The endpoint that was accessed
      request_time DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the API request was made
      success BOOLEAN DEFAULT 1,                        -- Whether the API request was successful (1) or failed (0)
      FOREIGN KEY(api_key_id) REFERENCES api_keys(id)  -- Foreign key reference to the api_keys table
    )`,
    (err) => {
      if (err) {
        console.error("Error creating API key usage logs table", err);
      } else {
        console.log("API key usage logs table created or already exists.");
      }
    }
  );

});

db.close((err) => {
  if (err) {
    console.error("Error closing the database connection", err);
  } else {
    console.log("Database initialization complete and connection closed.");
  }
});
