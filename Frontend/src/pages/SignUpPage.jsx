import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Input, PasswordStrengthMeter } from "../components";
import { Loader, Lock, Mail, User, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuthStore } from "../store/authStore";
import useContextData from "../hooks/useContextData";

const SignUpPage = () => {
  const { context, handleKeyDown } = useContextData();
  const recaptchaRef = useRef(null);
  const [captcha, setCaptcha] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signup, error, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleCaptcha = (value) => setCaptcha(value || "");

  const handleSignUp = async (e) => {
    e.preventDefault();
    const captchaToken = recaptchaRef.current?.getValue?.() || captcha;
    if (!captchaToken) return;
    try {
      await signup(name, email, password, context || {}, captchaToken);
      navigate("/");
    } catch (err) {}
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
          <h1 className="text-2xl font-bold text-[var(--bank-text)]">Create your account</h1>
          <p className="text-sm text-[var(--bank-text-muted)] mt-1">Open a SecureBank account in minutes</p>
        </div>

        <form onSubmit={handleSignUp}>
          <Input icon={User} type="text" placeholder="Full name" value={name} onKeyDown={handleKeyDown} onChange={(e) => setName(e.target.value)} required />
          <Input icon={Mail} type="email" placeholder="Email address" value={email} onKeyDown={handleKeyDown} onChange={(e) => setEmail(e.target.value)} required />
          <Input icon={Lock} type="password" placeholder="Password" value={password} onKeyDown={handleKeyDown} onChange={(e) => setPassword(e.target.value)} required />
          <PasswordStrengthMeter password={password} />
          <div className="flex justify-center my-4">
            <ReCAPTCHA ref={recaptchaRef} sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" onChange={handleCaptcha} />
          </div>
          {!captcha && <p className="text-sm text-[var(--bank-warning)] mb-2">Complete the captcha to continue.</p>}
          {error && <p className="text-sm text-[var(--bank-error)] font-medium mb-2">{error}</p>}
          <motion.button
            type="submit"
            disabled={isLoading || !captcha}
            className="w-full btn-bank-accent py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : "Create account"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-[var(--bank-text-muted)] mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[var(--bank-primary)] hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
