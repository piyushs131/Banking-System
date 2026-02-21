import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";
import axios from "axios";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";

const RESEND_TIMEOUT = 60;

const TransactionVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const [timer, setTimer] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { logout } = useAuthStore();

  useEffect(() => {
    if (timer > 0) {
      const t = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(t);
    }
    setCanResend(true);
  }, [timer]);

  const handleResend = () => {
    toast.success("Please try the transaction again to receive a new code.");
    setTimer(RESEND_TIMEOUT);
    setCanResend(false);
    navigate("/transactions");
  };

  const handleChange = (index, value) => {
    const newCode = [...code];
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) newCode[i] = pasted[i] || "";
      setCode(newCode);
      const last = newCode.findLastIndex((d) => d !== "");
      inputRefs.current[last < 5 ? last + 1 : 5]?.focus();
    } else {
      newCode[index] = value.slice(0, 1);
      setCode(newCode);
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      toast.error("Enter the full 6-digit code.");
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(
        "/api/transactions/verify",
        { verificationCode },
        { withCredentials: true }
      );
      toast.success("Transaction verified.");
      navigate("/transaction-history");
    } catch (err) {
      const msg = err.response?.data?.error || "Verification failed. Try again.";
      toast.error(msg);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20 pb-12 px-4 min-h-screen">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/transactions"
            className="flex items-center gap-2 text-sm font-medium text-[var(--bank-primary)] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to transfer
          </Link>
          <button
            onClick={() => { logout(); toast.success("Logged out."); }}
            className="flex items-center gap-2 text-sm font-medium text-[var(--bank-error)] hover:underline"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bank-card-elevated p-8"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-[var(--bank-primary)] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[var(--bank-text)]">Verify transaction</h1>
            <p className="text-sm text-[var(--bank-text-muted)] mt-1">
              Enter the 6-digit code sent to your email.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-12 text-center text-xl font-semibold bank-input"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--bank-text-muted)]">
                {canResend ? "Didn’t receive it?" : `Resend in ${timer}s`}
              </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className="font-medium text-[var(--bank-primary)] hover:underline disabled:opacity-50 disabled:no-underline"
              >
                Resend
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || code.join("").length !== 6}
              className="w-full btn-bank-accent py-3 rounded-lg font-semibold disabled:opacity-60"
            >
              {isSubmitting ? "Verifying…" : "Verify"}
            </button>
          </form>

          <p className="text-center mt-6">
            <Link to="/transactions" className="text-sm text-[var(--bank-primary)] hover:underline">
              Back to transfer
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TransactionVerificationPage;
