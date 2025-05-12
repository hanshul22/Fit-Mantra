const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const workoutController = require('./src/controllers/workoutController');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.post('/api/generate-workout', workoutController.generateWorkoutPlan);
app.get('/api/export-workout/:id', workoutController.exportWorkoutPlan);

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the workout generator`);
});