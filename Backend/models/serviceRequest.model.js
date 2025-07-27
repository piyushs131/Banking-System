import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true },
  phone:    { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  address:  { type: String, required: true },
  occupation: { type: String, required: true },
  service:  { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ServiceRequest", serviceRequestSchema); 