// Simple server startup without TypeScript aliases
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

// Basic app setup
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(cookieParser());
app.use(hpp());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/api', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running!' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
