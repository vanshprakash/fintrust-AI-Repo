const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
router.get(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    // req.user is available from the protect middleware and already excludes password
    const user = req.user

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        creditScore: user.creditScore,
        income: user.income,
        expenses: user.expenses,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);

// @desc    Update user profile
// @route   PUT /api/user/update
// @access  Private
router.put(
  '/update',
  protect,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please include a valid email'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be 6 or more characters'),
    body('creditScore')
      .optional()
      .isNumeric()
      .withMessage('Credit score must be a number'),
    body('income').optional().isNumeric().withMessage('Income must be a number'),
    body('expenses')
      .optional()
      .isNumeric()
      .withMessage('Expenses must be a number'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { users } = req.dataStore;
    const userIndex = users.findIndex(u => u._id === req.user._id);

    if (userIndex !== -1) {
      const user = users[userIndex];
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.creditScore = req.body.creditScore || user.creditScore;
      user.income = req.body.income || user.income;
      user.expenses = req.body.expenses || user.expenses;
      user.updatedAt = new Date().toISOString();

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }
      users[userIndex] = user; // Update the user in the array

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        creditScore: user.creditScore,
        income: user.income,
        expenses: user.expenses,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);

module.exports = router;
