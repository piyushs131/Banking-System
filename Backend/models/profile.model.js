import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String },
  fatherName: { type: String },
  dob: { type: String },
  pan: { type: String },
  aadhaarNumber: { type: String },
  profilePicture: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  branch: { type: String },
  accountType: { type: String },
  currentBalance: { type: String },
  accountSince: { type: String },
  maritalStatus: { type: String },
  nationality: { type: String },
  occupation: { type: String },
  gender: { type: String },
});

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
