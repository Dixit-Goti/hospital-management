import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middlewares/error.js';
import { successResponse } from './utils/response.js';
import { ApiError } from './utils/error.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());

// Error handling middleware (must be last)
app.use(errorHandler);

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});