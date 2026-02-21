import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  Calendar,
  Save,
  Edit,
  Home,
  CheckCircle,
  Copy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";
import axios from "axios";

const API_BASE = "/api/profile";

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
  branch: "",
  accountType: "",
  currentBalance: "",
  accountSince: "",
  maritalStatus: "",
  nationality: "",
  occupation: "",
  gender: "",
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(INIT_PROFILE);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      if (!user?.email) {
        toast.error("Please sign in to access your profile.");
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/me`, { withCredentials: true });
        const phone = res.data.phone || "";
        let countryCode = "+91";
        let phoneNumber = phone;
        const match = phone.match(/^(\+\d{1,4})(.*)$/);
        if (match) {
          countryCode = match[1];
          phoneNumber = match[2];
        }
        setProfile({ ...res.data, countryCode, phone: phoneNumber });
        setExists(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setProfile((prev) => ({ ...prev, email: user.email, fullName: user.name || "" }));
          setExists(false);
        } else {
          toast.error("Failed to load profile.");
        }
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, [user, navigate]);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const profileToSend = { ...profile, phone: profile.countryCode + profile.phone };
      await axios.put(`${API_BASE}/me`, profileToSend, { withCredentials: true });
      setExists(true);
      setIsEditing(false);
      toast.success(exists ? "Profile updated." : "Profile saved.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  const requiredFields = ["fullName", "email", "phone", "aadhaarNumber", "dob", "address", "gender"];
  const calculateCompletion = () => {
    let filled = 0;
    requiredFields.forEach((field) => {
      if (profile[field] && String(profile[field]).trim() !== "") filled++;
    });
    return Math.round((filled / requiredFields.length) * 100);
  };

  const getCompletionColor = (percent) => {
    if (percent <= 40) return "bg-[var(--bank-error)]";
    if (percent <= 70) return "bg-[var(--bank-warning)]";
    return "bg-[var(--bank-success)]";
  };

  const maskPan = (pan) => (pan ? pan.replace(/.(?=.{4})/g, "*") : "");
  const maskAadhaar = (aadhaar) => (aadhaar ? aadhaar.replace(/.(?=.{4})/g, "*") : "");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full border-4 border-[var(--bank-border)] border-t-[var(--bank-primary)] animate-spin mx-auto mb-4"
          />
          <p className="text-[var(--bank-text-muted)]">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bank-card-elevated overflow-hidden"
        >
          <div className="p-6 sm:p-8 border-b border-[var(--bank-border)]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="w-20 h-20 rounded-xl bg-[var(--bank-primary)] flex items-center justify-center shrink-0">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-[var(--bank-text)]">
                  {profile.fullName || "Complete your profile"}
                </h1>
                <p className="text-[var(--bank-text-muted)]">{profile.email || user?.email}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-[var(--bank-text-muted)] mb-1">
                    <span>Profile completion</span>
                    <span>{calculateCompletion()}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--bank-border)] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-2 ${getCompletionColor(calculateCompletion())}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateCompletion()}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn-bank-primary rounded-lg flex items-center gap-2 shrink-0"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>

          <form onSubmit={saveProfile} className="p-6 sm:p-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <FormField
                label="Full name"
                name="fullName"
                icon={User}
                value={profile.fullName}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <FormField
                type="email"
                label="Email"
                name="email"
                icon={Mail}
                value={profile.email}
                onChange={handleChange}
                disabled
              />
              <FormField
                label="Phone"
                name="phone"
                icon={Phone}
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
                countryCode={profile.countryCode}
                onCountryCodeChange={(e) => setProfile({ ...profile, countryCode: e.target.value })}
              />
              <FormField
                type="date"
                label="Date of birth"
                name="dob"
                icon={Calendar}
                value={profile.dob}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <FormField
                label="Gender"
                name="gender"
                icon={CheckCircle}
                value={profile.gender}
                onChange={handleChange}
                disabled={!isEditing}
                asSelect
                options={["", "Male", "Female", "Other", "Prefer not to say"]}
              />
              <div className="sm:col-span-2">
                <FormField
                  label="Address"
                  name="address"
                  icon={MapPin}
                  value={profile.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <FormField
                label="PAN"
                name="pan"
                icon={CreditCard}
                value={maskPan(profile.pan)}
                onChange={handleChange}
                disabled={!isEditing}
                copyValue={profile.pan}
              />
              <FormField
                label="Aadhaar"
                name="aadhaarNumber"
                icon={Shield}
                value={maskAadhaar(profile.aadhaarNumber)}
                onChange={handleChange}
                disabled={!isEditing}
                copyValue={profile.aadhaarNumber}
              />
              <FormField
                label="Marital status"
                name="maritalStatus"
                icon={CheckCircle}
                value={profile.maritalStatus}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <FormField
                label="Nationality"
                name="nationality"
                icon={Home}
                value={profile.nationality}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <FormField
                label="Occupation"
                name="occupation"
                icon={Edit}
                value={profile.occupation}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 rounded-lg border border-[var(--bank-border)] text-[var(--bank-text)] font-medium hover:bg-[var(--bank-bg)]"
                >
                  Cancel
                </button>
              )}
              <button type="submit" disabled={saving} className="btn-bank-accent rounded-lg px-6 py-3 disabled:opacity-60">
                {saving ? "Saving…" : exists ? "Update profile" : "Save profile"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  icon: Icon,
  onChange,
  disabled = false,
  type = "text",
  copyValue,
  countryCode,
  onCountryCodeChange,
  asSelect,
  options = [],
}) {
  const handleCopy = () => {
    if (copyValue) {
      navigator.clipboard.writeText(copyValue);
      toast.success(`${label} copied.`);
    }
  };

  if (name === "gender" || asSelect) {
    return (
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--bank-text)] mb-1.5">
          <Icon className="w-4 h-4" />
          {label}
        </label>
        <select
          name={name}
          className="bank-input"
          value={value}
          onChange={onChange}
          disabled={disabled}
        >
          {options.map((opt) => (
            <option key={opt || "_empty"} value={opt}>
              {opt || `Select ${label}`}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (name === "phone") {
    return (
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--bank-text)] mb-1.5">
          <Icon className="w-4 h-4" />
          {label}
        </label>
        <div className="flex gap-2">
          <select
            className="bank-input w-24"
            value={countryCode}
            onChange={onCountryCodeChange}
            disabled={disabled}
          >
            <option value="+91">+91</option>
            <option value="+1">+1</option>
            <option value="+44">+44</option>
            <option value="+61">+61</option>
            <option value="+81">+81</option>
            <option value="+971">+971</option>
          </select>
          <input
            type="tel"
            name={name}
            className="bank-input flex-1"
            placeholder={label}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-[var(--bank-text)] mb-1.5">
        <Icon className="w-4 h-4" />
        {label}
        {copyValue && (
          <Copy
            className="w-4 h-4 cursor-pointer text-[var(--bank-primary)] hover:opacity-80"
            onClick={handleCopy}
            title={`Copy ${label}`}
          />
        )}
      </label>
      <input
        type={type}
        name={name}
        className="bank-input"
        placeholder={`Enter ${label}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
