import ServiceRequest from "../models/serviceRequest.model.js";

export const createServiceRequest = async (req, res) => {
  try {
    const { fullName, email, phone, dateOfBirth, address, occupation, service } = req.body;
    if (!fullName || !email || !phone || !dateOfBirth || !address || !occupation || !service) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const newRequest = new ServiceRequest({ fullName, email, phone, dateOfBirth, address, occupation, service });
    await newRequest.save();
    res.status(201).json({ success: true, message: "Service request submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}; 