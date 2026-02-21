import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  CheckCircle, XCircle, DollarSign, Send, ShieldCheck, User,
  CreditCard, AlertCircle, Eye, EyeOff, Shield, ShieldAlert,
  AlertTriangle, Lock, Unlock, Globe, Monitor, Fingerprint,
  Zap, Activity, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import useContextData from "../hooks/useContextData";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const TransactionPage = () => {
  const [formData, setFormData] = useState({
    amount: "",
    recipientAccountNumber: "",
    purpose: "",
    note: "",
  });
  const [useBlockchain, setUseBlockchain] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [chainStatus, setChainStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [isLoadingRecipient, setIsLoadingRecipient] = useState(false);
  const [myAccountInfo, setMyAccountInfo] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(null);
  const [showBalance, setShowBalance] = useState(false);
  const [recentRecipients, setRecentRecipients] = useState([]);

  const { context, handleKeyDown } = useContextData();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchMyAccountDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const [accountResponse, balanceResponse, txnResponse] = await Promise.all([
          axios.get("/api/auth/my-account", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/transactions/balance", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/transactions", { withCredentials: true }).catch(() => ({ data: [] })),
        ]);
        if (accountResponse.data.success) setMyAccountInfo(accountResponse.data.accountDetails);
        if (balanceResponse.data.success) setCurrentBalance(balanceResponse.data.balance);
        // Extract recent unique recipients
        if (Array.isArray(txnResponse.data)) {
          const seen = new Set();
          const recent = [];
          for (const t of txnResponse.data) {
            if (!seen.has(t.accountNumber)) {
              seen.add(t.accountNumber);
              recent.push({ name: t.recipient, account: t.accountNumber });
            }
            if (recent.length >= 5) break;
          }
          setRecentRecipients(recent);
        }
      } catch (err) {
        console.error("Error fetching account:", err);
      }
    };
    fetchMyAccountDetails();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === "recipientAccountNumber") {
      if (e.target.value.length === 12) fetchRecipientDetails(e.target.value);
      else setRecipientInfo(null);
    }
  };

  const fetchRecipientDetails = async (accountNumber) => {
    if (accountNumber.length !== 12) return;
    setIsLoadingRecipient(true);
    try {
      const response = await axios.get(`/api/auth/user/${accountNumber}`);
      setRecipientInfo(response.data.success ? response.data.user : null);
    } catch {
      setRecipientInfo(null);
    } finally {
      setIsLoadingRecipient(false);
    }
  };

  // Risk assessment preview
  const riskPreview = useMemo(() => {
    const amount = Number(formData.amount) || 0;
    const factors = [];
    let level = "low";

    if (amount > 100000) { factors.push("Very high transaction amount"); level = "high"; }
    else if (amount > 50000) { factors.push("High transaction amount"); level = "medium"; }

    if (amount > 10000 && (user?.riskScore || 0) >= 5) {
      factors.push("Elevated account risk score");
      level = level === "low" ? "medium" : level;
    }

    const loginHour = new Date().getHours();
    if (loginHour < 6 || loginHour > 22) {
      factors.push("Transaction outside business hours");
      level = level === "low" ? "medium" : level;
    }

    if (!recipientInfo && formData.recipientAccountNumber.length === 12) {
      factors.push("Unverified recipient account");
      level = "medium";
    }

    if (factors.length === 0) factors.push("No risk factors detected");

    const config = {
      low: { color: "var(--bank-risk-low)", bg: "var(--bank-risk-low-bg)", label: "Low Risk", icon: ShieldCheck },
      medium: { color: "var(--bank-risk-medium)", bg: "var(--bank-risk-medium-bg)", label: "Medium Risk", icon: AlertTriangle },
      high: { color: "var(--bank-risk-high)", bg: "var(--bank-risk-high-bg)", label: "High Risk", icon: ShieldAlert },
    }[level];

    return { level, factors, ...config };
  }, [formData.amount, formData.recipientAccountNumber, recipientInfo, user?.riskScore]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (currentBalance !== null && Number(formData.amount) > currentBalance) {
      setError("Insufficient balance");
      toast.error("Insufficient balance.");
      return;
    }
    // Self-transfer check
    if (myAccountInfo && formData.recipientAccountNumber === myAccountInfo.accountNumber) {
      setError("Cannot send money to yourself");
      toast.error("Cannot send money to yourself.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setTxHash("");
    setChainStatus("");
    try {
      const token = localStorage.getItem("token");
      const endpoint = useBlockchain ? "/api/transactions/create" : "/api/transactions";
      const res = await axios.post(
        endpoint,
        { ...formData, context, useBlockchain },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success === false) {
        if (res.data.message?.includes("Suspicious")) {
          setError(res.data.message);
          toast.error("Transaction blocked. Check your email.");
          return;
        }
        if (res.data.requireVerification) {
          setError("Verification required. Check your email.");
          toast.success("Verification code sent to your email.");
          navigate("/transaction-verification");
          return;
        }
      }
      toast.success("Transaction successful.");
      navigate("/transaction-history");
      setFormData({ amount: "", recipientAccountNumber: "", purpose: "", note: "" });
      if (res?.data?.txHash) {
        setTxHash(res.data.txHash);
        setChainStatus(res.data.chainStatus || "Confirmed");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Transaction failed. Please try again.";
      setError(msg);
      if (err?.response?.status === 403) toast.error("Transaction blocked. Check your email.");
      else if (err?.response?.data?.requireVerification) {
        toast.success("Verification code sent.");
        navigate("/transaction-verification");
      } else toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const RiskIcon = riskPreview.icon;

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bank-primary)] flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--bank-text)]">Transfer money</h1>
              <p className="text-[var(--bank-text-muted)] mt-0.5 text-sm">Secure transfer with AI fraud detection & optional blockchain verification</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left – balance & account & security */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Balance */}
            <div className="bank-card-elevated p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--bank-text)] flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[var(--bank-success)]" />
                  Balance
                </h3>
                <button type="button" onClick={() => setShowBalance(!showBalance)} className="p-1 rounded hover:bg-[var(--bank-bg)]">
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-2xl font-bold text-[var(--bank-text)]">
                {showBalance ? `₹${currentBalance?.toLocaleString() ?? "0"}` : "••••••"}
              </p>
              <p className="text-xs text-[var(--bank-text-muted)] mt-1">Available</p>
            </div>

            {/* My Account */}
            {myAccountInfo && (
              <div className="bank-card-elevated p-6">
                <h3 className="font-semibold text-[var(--bank-text)] mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[var(--bank-primary)]" />
                  My account
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[var(--bank-text-muted)]">Name</span><span className="font-medium text-[var(--bank-text)]">{myAccountInfo.name}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--bank-text-muted)]">Account</span><span className="font-mono text-[var(--bank-text)]">{myAccountInfo.accountNumber}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--bank-text-muted)]">IFSC</span><span className="font-mono text-[var(--bank-text)]">{myAccountInfo.ifscCode}</span></div>
                </div>
                <p className="text-xs text-[var(--bank-text-muted)] mt-4 text-center">Share to receive money</p>
              </div>
            )}

            {/* Transaction Risk Preview */}
            {formData.amount && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bank-card-cyber p-5">
                <h3 className="font-semibold text-[var(--bank-text)] mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[var(--bank-primary)]" />
                  Risk Assessment
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: riskPreview.bg }}>
                    <RiskIcon className="w-5 h-5" style={{ color: riskPreview.color }} />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--bank-text)]" style={{ color: riskPreview.color }}>{riskPreview.label}</p>
                    <p className="text-xs text-[var(--bank-text-muted)]">Pre-transaction analysis</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {riskPreview.factors.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: riskPreview.color }} />
                      <span className="text-[var(--bank-text-muted)]">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 risk-meter">
                  <div
                    className="risk-meter-fill"
                    style={{
                      width: riskPreview.level === "low" ? "25%" : riskPreview.level === "medium" ? "60%" : "90%",
                      background: riskPreview.color,
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Recent Recipients */}
            {recentRecipients.length > 0 && (
              <div className="bank-card-elevated p-5">
                <h3 className="font-semibold text-[var(--bank-text)] mb-3 flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-[var(--bank-text-subtle)]" />
                  Recent Recipients
                </h3>
                <div className="space-y-2">
                  {recentRecipients.map((r) => (
                    <button
                      key={r.account}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, recipientAccountNumber: r.account }));
                        fetchRecipientDetails(r.account);
                      }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--bank-bg)] border border-[var(--bank-border)] transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--bank-primary)]/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-[var(--bank-primary)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--bank-text)] truncate">{r.name}</p>
                        <p className="text-xs font-mono text-[var(--bank-text-muted)]">{r.account}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Security Context Info */}
            <div className="bank-card-elevated p-5">
              <h3 className="font-semibold text-[var(--bank-text)] mb-3 flex items-center gap-2 text-sm">
                <Fingerprint className="w-4 h-4 text-[var(--bank-cyber-blue)]" />
                Session Security
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-[var(--bank-bg)]">
                  <span className="text-[var(--bank-text-muted)] flex items-center gap-1"><Globe className="w-3 h-3" />IP</span>
                  <span className="font-mono text-[var(--bank-text)]">{context?.ip || "Detecting…"}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[var(--bank-bg)]">
                  <span className="text-[var(--bank-text-muted)] flex items-center gap-1"><Monitor className="w-3 h-3" />Browser</span>
                  <span className="text-[var(--bank-text)]">{context?.browser || "—"}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[var(--bank-bg)]">
                  <span className="text-[var(--bank-text-muted)] flex items-center gap-1"><Activity className="w-3 h-3" />Screen</span>
                  <span className="text-[var(--bank-text)]">{context?.screenSize || "—"}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right – form */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <div className="bank-card-elevated p-6 sm:p-8">
              {/* Blockchain toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bank-bg)] border border-[var(--bank-border)] mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bank-primary)] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--bank-text)]">Secure via blockchain</p>
                    <p className="text-xs text-[var(--bank-text-muted)]">Immutable ledger verification</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={useBlockchain}
                  onClick={() => setUseBlockchain((v) => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${useBlockchain ? "bg-[var(--bank-primary)]" : "bg-[var(--bank-border)]"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${useBlockchain ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" onKeyDown={handleKeyDown}>
                {/* Recipient */}
                <div>
                  <label className="block text-sm font-medium text-[var(--bank-text)] mb-1.5">
                    Recipient account number <span className="text-[var(--bank-error)]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="recipientAccountNumber"
                      value={formData.recipientAccountNumber}
                      onChange={handleChange}
                      required
                      placeholder="12-digit account number"
                      className="bank-input pr-10"
                      maxLength={12}
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--bank-text-subtle)]" />
                  </div>
                  {isLoadingRecipient && (
                    <p className="text-xs text-[var(--bank-text-muted)] mt-1 flex items-center gap-1">
                      <span className="inline-block w-4 h-4 border-2 border-[var(--bank-primary)] border-t-transparent rounded-full animate-spin" />
                      Verifying recipient…
                    </p>
                  )}
                  <AnimatePresence>
                    {recipientInfo && !isLoadingRecipient && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-4 rounded-xl bg-[var(--bank-success-bg)] border border-[var(--bank-success)]/30"
                      >
                        <div className="flex items-center gap-2 text-[var(--bank-success)] font-medium">
                          <CheckCircle className="w-5 h-5" />
                          <span>Verified: {recipientInfo.name} · {recipientInfo.accountNumber}</span>
                        </div>
                        {recipientInfo.ifscCode && (
                          <p className="text-xs text-[var(--bank-success)] mt-1 ml-7">IFSC: {recipientInfo.ifscCode}</p>
                        )}
                      </motion.div>
                    )}
                    {!recipientInfo && !isLoadingRecipient && formData.recipientAccountNumber.length === 12 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-4 rounded-xl bg-[var(--bank-warning-bg)] border border-[var(--bank-warning)]/30"
                      >
                        <div className="flex items-center gap-2 text-[var(--bank-warning)] font-medium text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          Account not found. Please verify the account number.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-[var(--bank-text)] mb-1.5">
                    Amount (₹) <span className="text-[var(--bank-error)]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bank-text-muted)]">₹</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="0"
                      className="bank-input pl-8"
                    />
                  </div>
                  {currentBalance != null && Number(formData.amount) > currentBalance && (
                    <p className="text-xs text-[var(--bank-error)] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Insufficient balance. Available: ₹{currentBalance?.toLocaleString()}
                    </p>
                  )}
                  {Number(formData.amount) > 50000 && (
                    <p className="text-xs text-[var(--bank-warning)] mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> High-value transaction. Additional verification may be required.
                    </p>
                  )}
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-[var(--bank-text)] mb-1.5">
                    Purpose <span className="text-[var(--bank-error)]">*</span>
                  </label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="e.g. Bill payment, rent"
                    className="bank-input resize-none"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-[var(--bank-text)] mb-1.5">Note (optional)</label>
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Note for recipient"
                    className="bank-input"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--bank-error-bg)] text-[var(--bank-error)]">
                    <XCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                {/* Security notice */}
                <div className="p-3 rounded-lg bg-[var(--bank-bg)] border border-[var(--bank-border)]">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-[var(--bank-primary)] mt-0.5 shrink-0" />
                    <div className="text-xs text-[var(--bank-text-muted)]">
                      <p className="font-medium text-[var(--bank-text)] mb-1">Cybersecurity Protection Active</p>
                      <p>Your transaction is protected by AI-powered fraud detection, behavioral biometrics analysis, and {useBlockchain ? "Ethereum blockchain verification" : "server-side validation"}. Suspicious activity will trigger email alerts and may require additional verification.</p>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-bank-accent py-4 rounded-lg flex items-center justify-center gap-2 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing securely…
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send money
                      {useBlockchain && <Lock className="w-4 h-4 ml-1" />}
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
