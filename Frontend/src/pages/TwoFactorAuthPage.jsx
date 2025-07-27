import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";

const RESEND_TIMEOUT = 60; // seconds

const TwoFactorAuthPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const { twoFAEmail, verifyTwoFactorAuth, isLoading, error } = useAuthStore();

  const [timer, setTimer] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleResend = async () => {
    try {
      // For now, we'll just show a message since we need to implement resend 2FA
      toast.success("Please try logging in again to receive a new code!");
      setTimer(RESEND_TIMEOUT);
      setCanResend(false);
    } catch (err) {
      toast.error("Failed to resend code.");
    }
  };

  const handleChange = (index, value) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedValue = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedValue[i] || "";
      }
      setCode(newCode);
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value.slice(0, 1); // Allow only one character
      setCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      // Move to the previous input if the current one is empty and backspace is pressed
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const verificationCode = code.join("");
    try {
      await verifyTwoFactorAuth(twoFAEmail, verificationCode);
      navigate("/");
      toast.success("Two-factor authentication completed successfully!");
    } catch (error) {
      console.error("Two-factor authentication failed:", error);
    }
  };

  // Auto Submit when all inputs are filled
  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit"));
    }
  }, [code]);

  // Redirect if no 2FA email is set
  useEffect(() => {
    if (!twoFAEmail) {
      navigate("/login");
    }
  }, [twoFAEmail, navigate]);

  return (
    <div className="min-h-screen w-full pt-20 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-violet-500 text-transparent bg-clip-text mb-6">
          Two-Factor Authentication
        </h2>
        <p className="text-center text-gray-400 mb-2">
          Enter the verification code sent to your email.
        </p>
        <p className="text-center mb-6 text-violet-500">{twoFAEmail}</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="6"
                value={digit}
                onChange={(e) => {
                  handleChange(index, e.target.value);
                }}
                onKeyDown={(e) => {
                  handleKeyDown(index, e);
                }}
                className="w-12 h-12 text-center text-2xl bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-400">
              {canResend
                ? "Didn't receive the code?"
                : `Resend available in ${timer}s`}
            </span>
            <button
              type="button"
              className={`ml-2 text-blue-400 font-semibold hover:underline disabled:text-gray-500`}
              onClick={handleResend}
              disabled={!canResend}
            >
              Resend
            </button>
          </div>
          {error && <p className="text-red-500 text-sm pb-2">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 font-semibold bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
            type="submit"
            disabled={isLoading || code.some((digit) => !digit)}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default TwoFactorAuthPage;
