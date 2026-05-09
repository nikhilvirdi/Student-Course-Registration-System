const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const errorHandler = require('./utils/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: "SCRS Backend API is running..." });
});

// Route Registration
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/courses', require('./modules/courses/courses.routes'));
app.use('/api/students', require('./modules/students/students.routes'));
app.use('/api/enrollments', require('./modules/enrollments/enrollments.routes'));

// Global Error Handler (Must be last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
