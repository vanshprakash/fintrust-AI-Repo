const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Dummy loan calculation logic
const calculateLoanDetails = (income, expenses, amount, term, creditScore) => {
  // Basic EMI calculation (simplified for prototype)
  // Monthly interest rate
  const annualInterestRate = 0.05 + (1 - creditScore / 850) * 0.1; // Higher score = lower rate
  const monthlyInterestRate = annualInterestRate / 12;
  const numberOfPayments = term * 12; // term in years

  let emi;
  if (monthlyInterestRate === 0) {
    emi = amount / numberOfPayments;
  } else {
    emi =
      (amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  }

  // Dummy probability and approval logic
  let probability = 0;
  let approvalStatus = 'Pending';

  const disposableIncome = income - expenses;
  const debtToIncomeRatio = emi / income;

  // Factors influencing probability and approval
  if (disposableIncome > emi * 1.5 && creditScore >= 700 && debtToIncomeRatio < 0.3) {
    probability = 0.95;
    approvalStatus = 'Approved';
  } else if (disposableIncome > emi * 1.2 && creditScore >= 640 && debtToIncomeRatio < 0.4) {
    probability = 0.75;
    approvalStatus = 'Approved';
  } else if (disposableIncome > emi && creditScore >= 580 && debtToIncomeRatio < 0.5) {
    probability = 0.5;
    approvalStatus = 'Pending';
  } else {
    probability = 0.2;
    approvalStatus = 'Rejected';
  }

  // Adjust probability based on credit score more directly
  if (creditScore < 580) {
    probability *= 0.5;
    if (probability < 0.3) approvalStatus = 'Rejected';
  } else if (creditScore > 750) {
    probability = Math.min(probability * 1.2, 0.99);
  }

  probability = Math.round(probability * 100) / 100; // Round to 2 decimal places

  return { emi, probability, approvalStatus };
};

// @desc    Calculate loan details
// @route   POST /api/loan/calculate
// @access  Private
router.post(
  '/calculate',
  protect,
  [
    body('income').isNumeric().withMessage('Income must be a number'),
    body('expenses').isNumeric().withMessage('Expenses must be a number'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('term').isNumeric().withMessage('Term must be a number'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { income, expenses, amount, term } = req.body;
    const { users, loans } = req.dataStore;

    const userIndex = users.findIndex(u => u._id === req.user._id);

    if (userIndex !== -1) {
      const user = users[userIndex];
      // Update user's income and expenses
      user.income = income;
      user.expenses = expenses;
      user.updatedAt = new Date().toISOString();
      // No need to "save", it's already updated in the array

      const { emi, probability, approvalStatus } = calculateLoanDetails(
        income,
        expenses,
        amount,
        term,
        user.creditScore // Use user's credit score in calculation
      );

      // Save loan request to history
      const loan = {
        _id: req.dataStore.loanIdCounter++,
        user: req.user._id,
        income,
        expenses,
        amount,
        term,
        emi,
        probability,
        approvalStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      loans.push(loan);

      res.status(200).json({
        emi: emi.toFixed(2), // Format to 2 decimal places
        probability,
        approvalStatus,
        loanId: loan._id,
        message: 'Loan calculation successful',
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);

// @desc    Get user loan history
// @route   GET /api/loan/history
// @access  Private
router.get(
  '/history',
  protect,
  asyncHandler(async (req, res) => {
    const { loans } = req.dataStore;
    const userLoans = loans.filter(loan => loan.user === req.user._id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(userLoans);
  })
);

module.exports = router;
