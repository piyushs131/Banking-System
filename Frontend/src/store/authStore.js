import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api/auth"
    : "/api/auth";

axios.defaults.withCredentials = true; // Enable sending cookies with requests

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isCheckingAuth: true,
  message: null,
  require2FA: false,
  twoFAEmail: null,

  signup: async (name, email, password, context, captcha) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        name,
        email,
        password,
        context, // Pass the context
        captcha, // Pass the captcha
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Sign Up failed",
        isLoading: false,
      });
      throw error;
    }
  },

  verifyEmail: async (verificationCode) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/verify-email`, {
        verificationCode,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return response.data; // Return the response data for further use if needed
    } catch (error) {
      set({
        error: error.response?.data?.message || "Email verification failed",
        isLoading: false,
      });
      throw error;
    }
  },

  resendVerificationCode: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/resend-verification`, {
        email,
      });
      set({
        isLoading: false,
        error: null,
        message:
          response.data.message || "Verification code resent successfully",
      });
    } catch (error) {
      set({
        error:
          error.response?.data?.message || "Failed to resend verification code",
        isLoading: false,
      });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/check-auth`);
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        isCheckingAuth: false,
      });
    } catch (error) {
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        isCheckingAuth: false,
        error: null,
      });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${API_URL}/logout`);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Logout failed",
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email, password, context, captcha) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
        context, // Pass the context
        captcha,
      });
      
      // Check if 2FA is required
      if (response.data.require2FA) {
        set({
          isLoading: false,
          error: null,
          message: response.data.message,
          require2FA: true,
          twoFAEmail: response.data.email,
        });
        return response.data; // Return the response for 2FA handling
      }
      
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        require2FA: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Login failed",
        isLoading: false,
        require2FA: false,
      });
      throw error;
    }
  },

  verifyTwoFactorAuth: async (email, verificationCode) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/verify-2fa`, {
        email,
        verificationCode,
      });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        require2FA: false,
        twoFAEmail: null,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Two-factor authentication failed",
        isLoading: false,
      });
      throw error;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, {
        email,
      });
      set({
        isLoading: false,
        error: null,
        message: response.data.message || "Reset link sent successfully",
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error sending reset link",
        isLoading: false,
      });
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`, {
        newPassword,
      });
      set({
        isLoading: false,
        error: null,
        message: response.data.message || "Password reset successfully",
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Error resetting password",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/delete-account`);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Account deletion failed",
        isLoading: false,
      });
      throw error;
    }
  },
}));
