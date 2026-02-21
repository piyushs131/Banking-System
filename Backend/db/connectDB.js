import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI;
    const conn = await mongoose.connect(mongoUrl);
    console.log(`Mongodb is connected ${conn.connection.host}`)
  } catch (error) {
    console.log(`Error connection to mongodb: ${error.message}`);
    process.exit(1); // failure, 0 is success
  }  
}

export default connectDB;
