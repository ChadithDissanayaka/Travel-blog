require('dotenv').config(); // Load environment variables from .env file
//require("./db/init"); // Initialize the database tables
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require("morgan");
const logger = require("./utils/logger"); 

const authRoutes = require('./routes/authRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const countryRoutes = require('./routes/countryRoutes');
const blogPostRoutes = require('./routes/blogPostRoutes');
const userRoutes = require('./routes/userRoutes');
const likeRoutes = require('./routes/likeRoutes');
const commentRoutes = require('./routes/commentRoutes');


const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cookieParser());

// Log HTTP requests
app.use(morgan("combined", {
    stream: {
        write: (message) => logger.info(message.trim()) // Logs HTTP requests to Winston
    }
}));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/apikeys', apiKeyRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/blogposts', blogPostRoutes);
app.use('/api/user', userRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

// API Health Check Endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "API is running." });
});

// Start server
app.listen(port, () => {
    logger.info("Health check request received");
    console.log(`Server running on port ${port}`);
});
