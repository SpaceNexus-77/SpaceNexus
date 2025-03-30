const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const postcardRoutes = require('./routes/postcardRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const experimentRoutes = require('./routes/experimentRoutes');

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/postcards', postcardRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/experiments', experimentRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'SpaceNexus API Service',
    version: '1.0.0',
    status: 'running'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`SpaceNexus API service running on port ${PORT}`);
});