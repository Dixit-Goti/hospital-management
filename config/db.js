import mongoose from "mongoose";


const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10, // Adjust based on your app's needs
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Timeout for operations
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    // Handle connection events
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected. Attempting to reconnect...");
    });
    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected");
    });
  } catch (error) {
    console.log(`MongoDB connection error: ${error.message}`);
    // Optionally retry connection or notify (don't exit in production)
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

export default connectDB;
