const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send('Invalid token.');
    }
    req.user = decoded;  // Includes both id and role
    next();
  });
};

module.exports = authMiddleware;
