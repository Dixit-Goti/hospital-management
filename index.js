import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import errorHandler from './middlewares/error.js';
import { successResponse } from './utils/response.js';
import { ApiError } from './utils/error.js';

import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import medicineRoutes from './routes/medicine.routes.js';
import visitRoutes from './routes/visit.routes.js';
import prescriptionRoutes from './routes/prescription.routes.js';

dotenv.config();
const app = express();

connectDB();
app.use(cors()); // Add CORS
app.use(express.json());

app.get('/', (req, res) => res.send('API is running...')); // Optional root route

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
