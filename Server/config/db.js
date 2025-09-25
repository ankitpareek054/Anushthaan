import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dbURI = "your_mongodb_connection_string_here"; 
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); 
  }
};

export default connectDB;
