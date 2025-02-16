const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET_KEY;

module.exports = {
    generateToken: (payload) => {
        return jwt.sign(payload, SECRET_KEY);
    },
    verifyToken: (token) => {
        return jwt.verify(token, SECRET_KEY);
    }
}