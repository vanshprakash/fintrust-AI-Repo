const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoints

// Endpoint 1: Calculate Loan and AI Prediction
app.post('/api/calculate-loan', (req, res) => {
    const { monthlyIncome, expenses, loanAmount, loanTerm } = req.body;

    // Validate input
    if (isNaN(monthlyIncome) || isNaN(expenses) || isNaN(loanAmount) || isNaN(loanTerm) || loanTerm <= 0) {
        return res.status(400).json({ error: 'Please enter valid numbers for all fields and a positive loan term.' });
    }

    // Simple EMI Calculation (Illustrative, not real-world accurate)
    const annualInterestRate = 0.10; // Assuming a fixed annual interest rate of 10%
    const monthlyInterestRate = annualInterestRate / 12;
    const emi = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTerm)) / (Math.pow(1 + monthlyInterestRate, loanTerm) - 1);

    // --- Structured AI-like Scoring Logic ---
    let score = 0;
    let explanation = [];

    const income = parseFloat(monthlyIncome);
    const expenseRatio = expenses / income;
    const emiRatio = emi / income;

    // 1️⃣ Income Strength
    if (income >= 50000) {
        score += 30;
        explanation.push("Strong monthly income increased your score.");
    } else if (income >= 30000) {
        score += 20;
        explanation.push("Moderate income contributed positively.");
    } else {
        score += 10;
        explanation.push("Lower income slightly reduced your approval strength.");
    }

    // 2️⃣ Expense Ratio
    if (expenseRatio < 0.4) {
        score += 30;
        explanation.push("Low expense ratio shows good financial discipline.");
    } else if (expenseRatio < 0.7) {
        score += 15;
        explanation.push("Moderate expense ratio slightly affected score.");
    } else {
        score += 5;
        explanation.push("High expense ratio negatively impacted your score.");
    }

    // 3️⃣ EMI Burden
    if (emiRatio < 0.3) {
        score += 30;
        explanation.push("EMI burden is healthy compared to income.");
    } else if (emiRatio < 0.5) {
        score += 15;
        explanation.push("EMI burden is manageable but slightly risky.");
    } else {
        score += 5;
        explanation.push("High EMI burden reduced approval probability.");
    }

    // Final Probability
    let approvalProbability = (score / 90) * 100;
    if (approvalProbability > 100) approvalProbability = 100; // Cap at 100%

    // Determine approval status
    let approvalStatus;
    if (approvalProbability >= 70) {
        approvalStatus = 'Highly Likely';
    } else if (approvalProbability >= 40) {
        approvalStatus = 'Possible';
    } else {
        approvalStatus = 'Unlikely';
    }

    res.json({
        emi: emi.toFixed(2),
        approvalProbability: approvalProbability.toFixed(2),
        approvalStatus: approvalStatus,
        explanation: explanation
    });
});

// Endpoint 2: Explain AI Score
app.get('/api/explain-score', (req, res) => {
    // For simplicity, we'll use a mock explanation or derive it from query params
    // In a real app, this would query an AI model or a more complex logic
    const { income, expenses } = req.query;

    let explanations = [];

    if (income && expenses) {
        const incomeVal = parseFloat(income);
        const expensesVal = parseFloat(expenses);

        if (isNaN(incomeVal) || isNaN(expensesVal) || incomeVal <= 0) {
            return res.status(400).json({ error: 'Invalid income or expenses provided.' });
        }

        const expenseRatio = expensesVal / incomeVal;

        if (incomeVal >= 50000) {
            explanations.push("Your high income is a strong positive factor, indicating good repayment capacity.");
        } else if (incomeVal >= 30000) {
            explanations.push("Your moderate income provides a stable foundation for credit, though higher income could further improve your score.");
        } else {
            explanations.push("Your income level is a neutral factor; increasing it could boost your creditworthiness.");
        }

        if (expenseRatio < 0.4) {
            explanations.push("Excellent expense management! Your low expense-to-income ratio significantly boosts your credit score.");
        } else if (expenseRatio < 0.7) {
            explanations.push("Your expense-to-income ratio is within acceptable limits, but optimizing your spending could further enhance your score.");
        } else {
            explanations.push("Your high expense-to-income ratio indicates potential financial strain, which has negatively impacted your score.");
        }
    } else {
        explanations = [
            "Your credit score is influenced by various factors.",
            "Income stability plays a significant role.",
            "Responsible management of expenses is crucial.",
            "A healthy debt-to-income ratio leads to better scores.",
            "Timely bill payments reflect positively on your financial behavior."
        ];
    }


    res.json({
        reasons: explanations,
        summary: "Your score is a reflection of your financial habits and capacity."
    });
});

app.post('/api/explain-score', (req, res) => {
    // For simplicity, reusing the GET logic. In a real app, POST might accept more detailed user data.
    const { income, expenses } = req.body;
    let explanations = [];

    if (income && expenses) {
        const incomeVal = parseFloat(income);
        const expensesVal = parseFloat(expenses);

        if (isNaN(incomeVal) || isNaN(expensesVal) || incomeVal <= 0) {
            return res.status(400).json({ error: 'Invalid income or expenses provided.' });
        }

        const expenseRatio = expensesVal / incomeVal;

        if (incomeVal >= 50000) {
            explanations.push("Your high income is a strong positive factor, indicating good repayment capacity.");
        } else if (incomeVal >= 30000) {
            explanations.push("Your moderate income provides a stable foundation for credit, though higher income could further improve your score.");
        } else {
            explanations.push("Your income level is a neutral factor; increasing it could boost your creditworthiness.");
        }

        if (expenseRatio < 0.4) {
            explanations.push("Excellent expense management! Your low expense-to-income ratio significantly boosts your credit score.");
        } else if (expenseRatio < 0.7) {
            explanations.push("Your expense-to-income ratio is within acceptable limits, but optimizing your spending could further enhance your score.");
        } else {
            explanations.push("Your high expense-to-income ratio indicates potential financial strain, which has negatively impacted your score.");
        }
    } else {
        explanations = [
            "Your credit score is influenced by various factors.",
            "Income stability plays a significant role.",
            "Responsible management of expenses is crucial.",
            "A healthy debt-to-income ratio leads to better scores.",
            "Timely bill payments reflect positively on your financial behavior."
        ];
    }

    res.json({
        reasons: explanations,
        summary: "Your score is a reflection of your financial habits and capacity."
    });
});


// Endpoint 3: Dashboard Data
app.get('/api/dashboard-data', (req, res) => {
    // Mock data for UPI transactions and utility bill consistency
    const dashboardData = {
        upiTransactionsScore: Math.floor(Math.random() * (95 - 60 + 1)) + 60, // Score between 60 and 95
        utilityBillConsistency: ["Excellent", "Good", "Average", "Poor"][Math.floor(Math.random() * 4)],
        mobileRechargeBehavior: ["Excellent", "Good", "Average", "Poor"][Math.floor(Math.random() * 4)],
        spendingStabilityIndex: ["Excellent", "Good", "Average", "Poor"][Math.floor(Math.random() * 4)],
        alternativeDataChart: {
            data: [
                Math.floor(Math.random() * (90 - 70 + 1)) + 70, // UPI
                Math.floor(Math.random() * (95 - 75 + 1)) + 75, // Utility
                Math.floor(Math.random() * (80 - 50 + 1)) + 50, // Mobile
                Math.floor(Math.random() * (85 - 65 + 1)) + 65  // Spending
            ],
            labels: ['UPI', 'Utility', 'Mobile', 'Spending']
        },
        creditScore: Math.floor(Math.random() * (850 - 600 + 1)) + 600, // Score between 600 and 850
        approvalProbability: Math.floor(Math.random() * (90 - 30 + 1)) + 30 // Probability between 30 and 90
    };
    res.json(dashboardData);
});


// Serve the index.html for any other requests not matching an API route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
