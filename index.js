import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import errorHandler from "./middlewares/error.js";
import authRoutes from "./routes/auth.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import medicineRoutes from "./routes/medicine.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";

dotenv.config();
const app = express();

// Security middleware
app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());

// Root route for health check
app.get("/", (req, res) => res.send("API is running..."));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

// Global error handler
app.use(errorHandler);

// Start server after DB connection
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
