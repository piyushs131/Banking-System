import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Input } from "../components";
import { Lock, Mail, Loader, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import useContextData from "../hooks/useContextData";

const LoginPage = () => {
  const recaptchaRef = useRef(null);
  const [captcha, setCaptcha] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { context, handleKeyDown } = useContextData();
  const { login, error, isLoading, require2FA } = useAuthStore();
  const navigate = useNavigate();

  const handleCaptcha = (value) => setCaptcha(value || "");

  const handleLogin = async (e) => {
    e.preventDefault();
    const captchaToken = recaptchaRef.current?.getValue?.() || captcha;
    if (!captchaToken) return;
    try {
      const response = await login(email, password, context || {}, captchaToken);
      if (response?.require2FA) {
        toast.success("Two-factor authentication required. Check your email for the code.");
        navigate("/verify-2fa");
        return;
      }
      toast.success("Welcome back.");
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bank-card-elevated p-8"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-[var(--bank-primary)] flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--bank-text)]">Sign in to SecureBank</h1>
          <p className="text-sm text-[var(--bank-text-muted)] mt-1">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleLogin}>
          <Input
            icon={Mail}
            type="email"
            placeholder="Email address"
            value={email}
            onKeyDown={handleKeyDown}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onKeyDown={handleKeyDown}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-center my-4">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              onChange={handleCaptcha}
            />
          </div>
          {!captcha && (
            <p className="text-sm text-[var(--bank-warning)] mb-2">Complete the captcha to continue.</p>
          )}
          {error && <p className="text-sm text-[var(--bank-error)] font-medium mb-2">{error}</p>}
          <div className="mb-6">
            <Link to="/forget-password" className="text-sm font-medium text-[var(--bank-primary)] hover:underline">
              Forgot password?
            </Link>
          </div>
          <motion.button
            type="submit"
            disabled={isLoading || !captcha}
            className="w-full btn-bank-accent py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Sign in"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-[var(--bank-text-muted)] mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="font-semibold text-[var(--bank-primary)] hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
