import { motion } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Input } from "../components";
import { ArrowLeft, Loader, Mail, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { isloading, forgotPassword, error } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Error sending reset email:", err);
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
          <h1 className="text-2xl font-bold text-[var(--bank-text)]">Forgot password</h1>
          <p className="text-sm text-[var(--bank-text-muted)] mt-1">
            Enter your email and we’ll send you a reset link.
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <Input
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="text-sm text-[var(--bank-error)] font-medium mb-2">{error}</p>}
            <motion.button
              type="submit"
              disabled={isloading}
              className="w-full btn-bank-accent py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isloading ? <Loader className="w-5 h-5 animate-spin" /> : "Send reset link"}
            </motion.button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[var(--bank-success-bg)] flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-[var(--bank-success)]" />
            </div>
            <p className="text-sm text-[var(--bank-text-muted)]">
              If an account exists for <strong>{email}</strong>, you’ll receive a password reset link shortly.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--bank-primary)] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
