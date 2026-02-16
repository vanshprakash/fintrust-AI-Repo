const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be 6 or more characters'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const { users } = req.dataStore;

    // Check if user exists
    const userExists = users.find(u => u.email === email);

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = {
      _id: req.dataStore.userIdCounter++,
      name,
      email,
      password: hashedPassword,
      creditScore: Math.floor(Math.random() * (850 - 300 + 1) + 300), // Random credit score
      income: 0,
      expenses: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(user);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  })
);

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const { users } = req.dataStore;

    // Check for user email
    const user = users.find(u => u.email === email);
    
    const matchPassword = async (enteredPassword) => {
        if (!user || !user.password) {
            return false;
        }
        return await bcrypt.compare(enteredPassword, user.password);
    }

    if (user && (await matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  })
);

module.exports = router;
