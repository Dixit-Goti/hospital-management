import mongoose from "mongoose";
import winston from "winston";

// Initialize logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/db.log" }),
  ],
});

const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10, // Adjust based on your app's needs
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for operations
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    logger.info(`MongoDB Connected: ${mongoose.connection.host}`);

    // Handle connection events
    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting to reconnect...");
    });
    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    // Optionally retry connection or notify (don't exit in production)
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

export default connectDB;
