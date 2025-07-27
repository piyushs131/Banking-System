import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { User, Mail, Phone, MapPin, CreditCard, Shield, Calendar, Save, Edit, ArrowLeft, Home, CheckCircle, Copy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";
import axios from "axios";

const API_BASE = import.meta.env.MODE === "development"
  ? "http://localhost:5000/api/profile"
  : "/api/profile";

const INIT_PROFILE = {
  fullName: "",
  fatherName: "",
  dob: "",
  pan: "",
  aadhaarNumber: "",
  profilePicture: "",
  email: "",
  phone: "",
  countryCode: "+91",
  address: "",
  // Removed: accountNumber: "",
  // Removed: ifscCode: "",
  branch: "",
  accountType: "",
  currentBalance: "",
  accountSince: "",
  maritalStatus: "",
  nationality: "",
  occupation: "",
  gender: "", // Added gender field
};

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState(INIT_PROFILE);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      if (!user?.email) {
        toast.error("Please login to access your profile");
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/me`, { withCredentials: true });
        // Split phone into countryCode and phone number
        const phone = res.data.phone || "";
        let countryCode = "+91";
        let phoneNumber = phone;
        const match = phone.match(/^(\+\d{1,4})(.*)$/);
        if (match) {
          countryCode = match[1];
          phoneNumber = match[2];
        }
        setProfile({
          ...res.data,
          countryCode,
          phone: phoneNumber,
        });
        setExists(true);
      } catch (error) {
        if (error.response?.status === 404) {
          setProfile(prev => ({
            ...prev,
            email: user.email,
            fullName: user.name || ""
          }));
          setExists(false);
        } else {
          toast.error("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, [user, navigate]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const profileToSend = { ...profile, phone: profile.countryCode + profile.phone };
      await axios.put(`${API_BASE}/me`, profileToSend, { withCredentials: true });
      setExists(true);
      setIsEditing(false);
      toast.success("Profile created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const profileToSend = { ...profile, phone: profile.countryCode + profile.phone };
      await axios.put(`${API_BASE}/me`, profileToSend, { withCredentials: true });
      setIsEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const calculateCompletion = () => {
    let filled = 0;
    const required = ["fullName", "email", "phone", "accountNumber", "ifscCode", "aadhaarNumber", "dob", "address", "gender"];
    required.forEach(field => {
      if (profile[field] && profile[field].trim() !== "") filled++;
    });
    return Math.round((filled / required.length) * 100);
  };

  // Helper to get color based on completion
  const getCompletionColor = (percent) => {
    if (percent <= 40) return "bg-red-500";
    if (percent <= 70) return "bg-yellow-400";
    return "bg-green-500";
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const maskPan = (pan) => pan ? pan.replace(/.(?=.{4})/g, '*') : '';
  const maskAadhaar = (aadhaar) => aadhaar ? aadhaar.replace(/.(?=.{4})/g, '*') : '';

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}



      <div className="relative z-10 max-w-4xl mt-10 mx-auto py-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl border border-blue-500 shadow-2xl"
        >
          {/* Profile Summary */}
          <div className="p-8 border-b border-blue-800">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1 ">
                <h1 className="text-3xl font-bold text-black">
                  {profile.fullName || "Complete Your Profile"}
                </h1>
                <p className="text-black">{profile.email || user?.email}</p>
                <p className="text-sm text-blue-300">
                  {exists ? "Profile loaded" : "New profile"}
                </p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-black mb-1">
                    <span>Profile Completion</span>
                    <span>{calculateCompletion()}%</span>
                  </div>
                  <div className="w-full bg-blue-900 border border-blue-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={`h-2 ${getCompletionColor(calculateCompletion())}`}
                      style={{ width: `${calculateCompletion()}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateCompletion()}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"

                >
                  <Edit className="inline-block mr-1 w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <form className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={exists ? handleUpdate : handleSave}>
            <FormField label="Full Name" name="fullName" icon={User} value={profile.fullName} onChange={handleChange} disabled={!isEditing} />
            <FormField type="email" label="Email" name="email" icon={Mail} value={profile.email} onChange={handleChange} disabled={true} />
            <FormField label="Phone" name="phone" icon={Phone} value={profile.phone} onChange={handleChange} disabled={!isEditing} countryCode={profile.countryCode} onCountryCodeChange={e => setProfile({ ...profile, countryCode: e.target.value })} />
            <FormField type="date" label="DOB" name="dob" icon={Calendar} value={profile.dob} onChange={handleChange} disabled={!isEditing} />
            <FormField label="Gender" name="gender" icon={CheckCircle} value={profile.gender} onChange={handleChange} disabled={!isEditing} />
            <FormField label="Address" name="address" icon={MapPin} value={profile.address} onChange={handleChange} disabled={!isEditing} />
            {/* Removed Account Number and IFSC Code fields */}
            <FormField
              label="PAN Number"
              name="pan"
              icon={CreditCard}
              value={maskPan(profile.pan)}
              onChange={handleChange}
              disabled={!isEditing}
              copyValue={profile.pan}
            />
            <FormField
              label="Aadhaar Number"
              name="aadhaarNumber"
              icon={Shield}
              value={maskAadhaar(profile.aadhaarNumber)}
              onChange={handleChange}
              disabled={!isEditing}
              copyValue={profile.aadhaarNumber}
            />
            <FormField label="Marital Status" name="maritalStatus" icon={CheckCircle} value={profile.maritalStatus} onChange={handleChange} disabled={!isEditing} />
            <FormField label="Nationality" name="nationality" icon={Home} value={profile.nationality} onChange={handleChange} disabled={!isEditing} />
            <FormField label="Occupation / Employment Type" name="occupation" icon={Edit} value={profile.occupation} onChange={handleChange} disabled={!isEditing} />
            {/* Buttons */}
            <div className="col-span-full mt-8 flex gap-4 ">
              {isEditing && (
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 cursor-pointer py-3 border border-blue-500 bg-blue-700  rounded hover:bg-blue-700">

                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 cursor-pointer hover:from-blue-600 hover:to-violet-600 rounded"

              >
                {saving ? "Saving..." : exists ? "Update Profile" : "Save Profile"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function FormField({ label, name, value, icon: Icon, onChange, disabled = false, type = "text", copyValue, countryCode, onCountryCodeChange }) {
  const handleCopy = () => {
    if (copyValue) {
      navigator.clipboard.writeText(copyValue);
      toast.success(`${label} copied!`);
    }
  };
  // Special case for gender dropdown
  if (name === "gender") {
    return (
      <div className="relative">
        <label className="flex items-center gap-2 text-sm text-black mb-1">
          <Icon className="w-4 h-4" />
          {label}
        </label>
        <select
          name={name}
          className="w-full px-4 py-2 rounded bg-blue-950 text-white border border-blue-700 placeholder-blue-300 disabled:opacity-50"
          value={value}
          onChange={onChange}
          disabled={disabled}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
      </div>
    );
  }
  // Special case for phone with country code
  if (name === "phone") {
    return (
      <div className="relative">
        <label className="flex items-center gap-2 text-sm text-black mb-1">
          <Icon className="w-4 h-4" />
          {label}
        </label>
        <div className="flex gap-2">
          <select
            className="px-2 py-2 rounded bg-blue-950 text-white border border-blue-700 disabled:opacity-50"
            value={countryCode}
            onChange={onCountryCodeChange}
            disabled={disabled}
            style={{ maxWidth: 100 }}
          >
            <option value="+91">+91 (IN)</option>
            <option value="+1">+1 (US)</option>
            <option value="+44">+44 (UK)</option>
            <option value="+61">+61 (AU)</option>
            <option value="+81">+81 (JP)</option>
            <option value="+971">+971 (UAE)</option>
            {/* Add more as needed */}
          </select>
          <input
            type="tel"
            name={name}
            className="w-full px-4 py-2 rounded bg-blue-950 text-white border border-blue-700 placeholder-blue-300 disabled:opacity-50"
            placeholder={`Enter ${label}`}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="relative">
      <label className="flex items-center gap-2 text-sm text-black mb-1">
        <Icon className="w-4 h-4" />
        {label}
        {copyValue && (
          <Copy
            className="w-4 h-4 ml-1 cursor-pointer text-blue-600 hover:text-blue-800"
            onClick={handleCopy}
            title={`Copy ${label}`}
          />
        )}
      </label>
      <input
        type={type}
        name={name}
        className="w-full px-4 py-2 rounded bg-blue-950 text-white border border-blue-700 placeholder-blue-300 disabled:opacity-50"
        placeholder={`Enter ${label}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
