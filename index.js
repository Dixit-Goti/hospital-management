import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import winston from "winston";
import connectDB from "./config/db.js";
import errorHandler from "./middlewares/error.js";
import authRoutes from "./routes/auth.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import medicineRoutes from "./routes/medicine.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";

// Initialize logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/app.log" }),
  ],
});

dotenv.config();
const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000", // Restrict to your frontend URL
    credentials: true, // If using cookies/auth
  })
);
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});
app.use(limiter);

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
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
