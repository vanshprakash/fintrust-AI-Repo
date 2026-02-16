const express = require('express');
const cors = require('cors');

// In-memory data stores
const users = [];
let userIdCounter = 1;
const loans = [];
let loanIdCounter = 1;
const explanations = [];
let explanationIdCounter = 1;

const dataStore = {
  users,
  userIdCounter,
  loans,
  loanIdCounter,
  explanations,
  explanationIdCounter
};

// Middleware to attach dataStore to req
const attachDataStore = (req, res, next) => {
  req.dataStore = dataStore;
  next();
};

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const loanRoutes = require('./routes/loanRoutes');

// For JWT - hardcoding for this simplified backend
process.env.JWT_SECRET = 'your_jwt_secret_key_in_simple_backend';
process.env.NODE_ENV = 'development'; // Setting development mode

const app = express();
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use(cors());
app.use(express.json()); // Body parser for JSON data
app.use(attachDataStore); // Attach in-memory store to all requests

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/loan', loanRoutes);

// Basic error handling middleware (for asyncHandler errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
