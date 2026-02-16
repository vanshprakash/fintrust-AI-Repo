const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const { users } = req.dataStore;

      // Get user from the token
      const userFound = users.find(u => u._id === decoded.id);
      
      if(userFound) {
        // Create a new object without the password field
        const { password, ...userWithoutPassword } = userFound;
        req.user = userWithoutPassword;
      } else {
        req.user = null;
      }

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect };
