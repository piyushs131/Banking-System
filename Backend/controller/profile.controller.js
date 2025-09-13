
import Profile from '../models/profile.model.js';
import User from '../models/user.model.js';

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let profile = await Profile.findOne({ user: req.userId });
    if (!profile) {
      profile = await Profile.create({ user: req.userId });
    }

    const profileObj = profile.toObject();
    profileObj.fullName = user.fullName || user.name;
    profileObj.email = user.email;
    res.json(profileObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMyProfile = async (req, res) => {
// Get recent login activity
export const getLoginActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, loginHistory: user.loginHistory || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
  try {
    let profile = await Profile.findOne({ user: req.userId });
    if (!profile) {
      profile = await Profile.create({ user: req.userId });
    }
    // Update all fields from the request body
    const fields = [
      'fullName', 'fatherName', 'dob', 'pan', 'aadhaarNumber', 'profilePicture', 'email', 'phone', 'address',
      'branch', 'accountType', 'currentBalance', 'accountSince', 'maritalStatus', 'nationality', 'occupation', 'gender'
    ];
    fields.forEach(field => {
      if (req.body[field] !== undefined) profile[field] = req.body[field];
    });
    await profile.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
