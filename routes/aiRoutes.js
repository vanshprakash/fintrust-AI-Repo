const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Dummy AI logic for credit score explanation
const generateCreditExplanation = (score) => {
  const explanationPoints = [];

  if (score >= 750) {
    explanationPoints.push({
      title: 'Excellent Credit Standing',
      description: 'Your credit score is exceptionally high, indicating a very low risk to lenders. You are likely to qualify for the best interest rates and loan terms.',
    });
    explanationPoints.push({
      title: 'Payment History',
      description: 'Consistently making on-time payments has significantly contributed to your excellent score. This demonstrates reliability.',
    });
    explanationPoints.push({
      title: 'Credit Utilization',
      description: 'You are using a very small portion of your available credit, which is a key factor in maintaining a strong credit score.',
    });
  } else if (score >= 670) {
    explanationPoints.push({
      title: 'Good Credit Standing',
      description: 'Your credit score is good, making you eligible for most loans and credit products at favorable rates.',
    });
    explanationPoints.push({
      title: 'Consistent Payments',
      description: 'You generally make payments on time, which is positive for your credit health. Keep up the good work!',
    });
    explanationPoints.push({
      title: 'Moderate Credit Utilization',
      description: 'Your credit utilization is healthy, but there might be room for improvement by keeping balances even lower relative to your credit limits.',
    });
  } else if (score >= 580) {
    explanationPoints.push({
      title: 'Fair Credit Standing',
      description: 'Your credit score is fair. While you may qualify for credit, interest rates might be higher, and terms less favorable. There is significant room for improvement.',
    });
    explanationPoints.push({
      title: 'Occasional Late Payments',
      description: 'Occasional late payments have impacted your score. Focusing on timely payments will be beneficial.',
    });
    explanationPoints.push({
      title: 'Higher Credit Utilization',
      description: 'You might be using a larger portion of your available credit. Reducing your credit utilization can positively affect your score.',
    });
  } else {
    explanationPoints.push({
      title: 'Poor Credit Standing',
      description: 'Your credit score indicates high risk to lenders. You may find it difficult to obtain new credit or loans, and those you do get will likely have very high interest rates.',
    });
    explanationPoints.push({
      title: 'History of Late/Missed Payments',
      description: 'A history of late or missed payments is significantly damaging your credit score. This is the primary area to address.',
    });
    explanationPoints.push({
      title: 'High Credit Utilization',
      description: 'You are using a very high percentage of your available credit, which is a major red flag for lenders. Work on paying down existing debt.',
    });
  }

  return explanationPoints;
};

// @desc    Get AI explanation for credit score
// @route   POST /api/ai/explain-score
// @access  Private
router.post(
  '/explain-score',
  protect,
  asyncHandler(async (req, res) => {
    const { users, explanations } = req.dataStore;
    const user = users.find(u => u._id === req.user._id);

    if (user) {
      const creditScore = user.creditScore; // Assuming user's credit score is stored here
      const explanationPoints = generateCreditExplanation(creditScore);

      // Save explanation to DB (optional, but requested for a model)
      const explanation = {
        _id: req.dataStore.explanationIdCounter++,
        user: user._id,
        creditScore,
        explanationPoints,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      explanations.push(explanation);

      res.status(200).json({
        creditScore,
        explanationPoints,
        message: 'Credit score explanation generated successfully',
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);

module.exports = router;
