// config/jwt.js
const jwt = require('jsonwebtoken');
const { generateToken: generateCSRFToken } = require('./csrf');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { 
            id: user.id,
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    const csrfToken = generateCSRFToken();

    return {
        accessToken,
        csrfToken
    };
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateTokens,
    verifyToken
};
