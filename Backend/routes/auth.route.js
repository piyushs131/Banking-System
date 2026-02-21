import express from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
  checkAuth,
  deleteAccount,
  verifyTwoFactorAuth,
  findUserByAccountNumber,
  getMyAccountDetails,
  toggleMFA,
  trustDevice,
  trustIP,
  removeTrustedDevice,
  removeTrustedIP,
} from "../controller/auth.controller.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
router.post("/verify-2fa", verifyTwoFactorAuth);
router.post("/resend-verification", resendVerificationCode);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.delete("/delete-account", verifyToken, deleteAccount);

// Security management
router.post("/toggle-mfa", verifyToken, toggleMFA);
router.post("/trust-device", verifyToken, trustDevice);
router.post("/trust-ip", verifyToken, trustIP);
router.post("/remove-trusted-device", verifyToken, removeTrustedDevice);
router.post("/remove-trusted-ip", verifyToken, removeTrustedIP);

// Find user by account number (public route for transaction lookup)
router.get("/user/:accountNumber", findUserByAccountNumber);

// Get current user's account details (protected route)
router.get("/my-account", verifyToken, getMyAccountDetails);

export default router;
