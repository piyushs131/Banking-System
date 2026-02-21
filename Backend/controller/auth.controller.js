import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../models/user.model.js";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { verifyCaptcha } from "../utils/verifyCaptcha.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { evaluateContext } from "../utils/contextEvaluator.js";
import { getLocationName } from "../utils/getLocationName.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendResetSuccessEmail,
  sendAccountDeletionEmail,
  sendNewDeviceLoginAlert,
  sendSuspiciousActivityWarning,
  sendTwoFactorAuthEmail,
} from "../nodemailer/emails.js";
import { updateContextProfile } from "../utils/updateContextProfile.js";
import { generateAccountDetails } from "../utils/generateAccountDetails.js";
import { logSecurityEvent } from "../utils/securityLogger.js";

export const signup = async (req, res) => {
  const { email, password, name, context, captcha } = req.body;
  const ctx = context || {};
  const loc = ctx.location || { latitude: 0, longitude: 0 };
  try {
    if (!email || !password || !name) {
      throw new Error("All fields are required!");
    }

    if (!captcha) {
      return res
        .status(400)
        .json({ success: false, message: "Please complete the captcha" });
    }

    const userAlreadyExists = await User.findOne({ email: email.trim().toLowerCase() });

    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User Already Exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationCode();

    // Generate unique account details
    const accountDetails = generateAccountDetails();

    const isHuman = await verifyCaptcha(captcha);
    console.log("Captcha verification result:", isHuman);
    if (!isHuman) return res.status(403).json({ error: "Bot detected" });

    const user = new User({
      accountNumber: accountDetails.accountNumber,
      ifscCode: accountDetails.ifscCode,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      isVerified: true, // Auto-verify for easy signup - user can login immediately
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 60 * 1000,
      trustedIPs: [ctx.ip || req.ip || "unknown"],
      trustedDevices: [ctx.device || "unknown"],
      locations: [{ lat: loc.latitude, lon: loc.longitude }],
      contextLogs: [
        {
          ip: ctx.ip || req.ip || "unknown",
          device: ctx.device || "unknown",
          location: {
            lat: loc.latitude,
            lon: loc.longitude,
            locationName: "Unknown",
          },
          timestamp: new Date(),
          riskScore: 0,
        },
      ],
      behavioralProfile: {
        typingSpeed: ctx.typingSpeed,
        loginHours: ctx.loginHours || [],
      },
      riskScore: 0, // Initialize risk score
    });

    await user.save();

    // Send verification email in background (optional - user is already verified)
    sendVerificationEmail(user.email, verificationToken).catch((err) => {
      console.error("Verification email failed (user still created):", err.message);
    });

    // Auto-login: set cookie so user is immediately logged in
    generateTokenAndSetCookie(res, user._id);

    res.status(201).json({
      success: true,
      message: "Account created! You are now logged in.",
      user: {
        ...user._doc,
        password: undefined,
        trustedIPs: undefined,
        trustedDevices: undefined,
        locations: undefined,
        behavioralProfile: undefined,
        riskScore: undefined,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    let msg = error?.message || String(error) || "Sign up failed";
    if (error?.code === 11000) msg = "User Already Exists!";
    res.status(400).json({ success: false, message: msg });
  }
};

export const verifyEmail = async (req, res) => {
  const { verificationCode } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: verificationCode,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error verifying email:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required!",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found!" });
    }
    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified!" });
    }
    const verificationToken = generateVerificationCode();
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = Date.now() + 60 * 1000; // 1 minute
    await user.save();
    await sendVerificationEmail(user.email, verificationToken);
    res.status(200).json({
      success: true,
      message: "Verification code resent successfully",
    });
  } catch (error) {
    console.log("Error resending verification code:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required!",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found!" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();
    // Here you would send the reset token to the user's email
    sendResetPasswordEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset token sent to your email",
    });
  } catch (error) {
    console.log("Error during forgot password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    if (!newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New password is required!" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    sendResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log("Error during reset password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password, captcha } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    if (!captcha) {
      return res.status(400).json({ success: false, message: "Please complete the captcha" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const loginIP = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
    const loginUA = req.headers["user-agent"] || "unknown";

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Record failed login attempt
      if (!user.loginHistory) user.loginHistory = [];
      user.loginHistory.push({
        date: new Date(),
        ip: loginIP,
        userAgent: loginUA,
        successful: false,
      });
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const isHuman = await verifyCaptcha(captcha);
    if (!isHuman) {
      return res.status(400).json({ success: false, message: "Captcha verification failed. Please try again." });
    }

    // Record successful login attempt
    const loginEntry = {
      date: new Date(),
      ip: loginIP,
      userAgent: loginUA,
      successful: true,
    };
    if (!user.loginHistory) user.loginHistory = [];
    user.loginHistory.push(loginEntry);
    user.lastLogin = new Date();
    user.failedLoginAttempts = 0; // Reset on successful login

    // 2FA check
    if (user.mfaEnabled) {
      const verificationCode = generateVerificationCode();
      user.verificationToken = verificationCode;
      user.verificationTokenExpiresAt = Date.now() + 5 * 60 * 1000; // 5 min
      await user.save();

      // Send 2FA email
      await sendTwoFactorAuthEmail(user.email, user.name, verificationCode, {
        device: req.headers["user-agent"] || "Unknown",
        location: { latitude: 0, longitude: 0 },
        time: new Date().toLocaleString(),
      });

      return res.status(200).json({
        success: false,
        requires2FA: true,
        email: user.email,
        message: "A verification code has been sent to your email. Please enter it to complete login.",
      });
    }

    await user.save();

    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
        trustedIPs: undefined,
        trustedDevices: undefined,
        locations: undefined,
        behavioralProfile: undefined,
        riskScore: undefined,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ success: false, message: error?.message || "Login failed" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const checkAuth = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error checking authentication:", error);
    return res.status(401).json({ success: false, message: "Session expired" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await User.deleteOne({ _id: req.userId }); // Use deleteOne instead of remove
    res.clearCookie("token");
    await sendAccountDeletionEmail(user.email, user.name);
    res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get current user's account details
export const getMyAccountDetails = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      accountDetails: {
        name: user.name,
        accountNumber: user.accountNumber,
        ifscCode: user.ifscCode,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error("Error getting account details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Find user by account number
export const findUserByAccountNumber = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        message: "Account number is required"
      });
    }

    const user = await User.findOne({ accountNumber }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this account number"
      });
    }

    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        accountNumber: user.accountNumber,
        ifscCode: user.ifscCode
      }
    });
  } catch (error) {
    console.error("Error finding user by account number:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyTwoFactorAuth = async (req, res) => {
  const { email, verificationCode } = req.body;
  try {
    if (!email || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required!",
      });
    }

    const user = await User.findOne({
      email,
      verificationToken: verificationCode,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    // Clear the verification token
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    // Generate token and set cookie
    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: "Two-factor authentication completed successfully",
      user: {
        ...user._doc,
        password: undefined,
        trustedIPs: undefined,
        trustedDevices: undefined,
        locations: undefined,
        behavioralProfile: undefined,
        riskScore: undefined,
      },
    });
  } catch (error) {
    console.log("Error verifying two-factor authentication:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Security Management Endpoints ───

// Toggle 2FA
export const toggleMFA = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.mfaEnabled = !user.mfaEnabled;
    await user.save();
    res.status(200).json({ success: true, mfaEnabled: user.mfaEnabled, message: user.mfaEnabled ? "2FA enabled" : "2FA disabled" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Trust current device
export const trustDevice = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const device = req.headers["user-agent"] || "unknown";
    if (!user.trustedDevices.includes(device)) {
      user.trustedDevices.push(device);
      await user.save();
    }
    res.status(200).json({ success: true, trustedDevices: user.trustedDevices, message: "Device trusted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Trust current IP
export const trustIP = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || req.ip || "unknown";
    if (!user.trustedIPs.includes(ip)) {
      user.trustedIPs.push(ip);
      await user.save();
    }
    res.status(200).json({ success: true, trustedIPs: user.trustedIPs, message: "IP trusted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Remove trusted device
export const removeTrustedDevice = async (req, res) => {
  try {
    const { device } = req.body;
    if (!device) return res.status(400).json({ success: false, message: "Device string is required" });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.trustedDevices = user.trustedDevices.filter(d => d !== device);
    await user.save();
    res.status(200).json({ success: true, trustedDevices: user.trustedDevices, message: "Device removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Remove trusted IP
export const removeTrustedIP = async (req, res) => {
  try {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ success: false, message: "IP is required" });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.trustedIPs = user.trustedIPs.filter(i => i !== ip);
    await user.save();
    res.status(200).json({ success: true, trustedIPs: user.trustedIPs, message: "IP removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
