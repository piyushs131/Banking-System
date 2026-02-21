import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { formatDate } from "../utils/date";
import { toast } from "react-hot-toast";
import ContextStatus from "../components/ContextStatus";
import useContextData from "../hooks/useContextData";
import { ContextLogTable } from "../components";
import axios from "axios";
import {
  User, Mail, Calendar, Clock, CreditCard, Shield, Activity,
  Settings, Trash2, ArrowRight, TrendingUp, DollarSign, ShieldCheck,
  ShieldAlert, AlertTriangle, Monitor, Globe, Lock, Eye,
  EyeOff, ArrowUpRight, ArrowDownLeft, Fingerprint, History,
  CheckCircle, XCircle, Zap,
} from "lucide-react";

const DashboardPage = () => {
  const { user, deleteAccount } = useAuthStore();
  const { context } = useContextData();
  const [showBalance, setShowBalance] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(null);
  const [txnStats, setTxnStats] = useState(null);
  const [recentTxns, setRecentTxns] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const h = { Authorization: `Bearer ${token}` };
        const [balRes, statsRes, txnRes] = await Promise.all([
          axios.get("/api/transactions/balance", { headers: h }).catch(() => null),
          axios.get("/api/transactions/stats", { headers: h }).catch(() => null),
          axios.get("/api/transactions", { withCredentials: true }).catch(() => null),
        ]);
        if (balRes?.data?.success) setCurrentBalance(balRes.data.balance);
        if (statsRes?.data) setTxnStats(statsRes.data);
        if (Array.isArray(txnRes?.data)) setRecentTxns(txnRes.data.slice(0, 5));
      } catch { }
    };
    load();
  }, []);

  const handleDeleteAccount = () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    deleteAccount()
      .then(() => toast.success("Account deleted."))
      .catch(() => toast.error("Deletion failed."));
  };

  const securityScore = useMemo(() => {
    let s = 0, t = 0;
    t += 20; if (user?.mfaEnabled) s += 20;
    t += 20; if (user?.isVerified) s += 20;
    t += 15; if (user?.trustedDevices?.length > 0) s += 15;
    t += 15; if (user?.trustedIPs?.length > 0) s += 15;
    t += 15; if ((user?.riskScore || 0) < 5) s += 15;
    t += 15; if ((user?.failedLoginAttempts || 0) === 0) s += 15;
    return t > 0 ? Math.round((s / t) * 100) : 0;
  }, [user]);

  const threatLevel = securityScore >= 80 ? "low" : securityScore >= 50 ? "medium" : "high";
  const thr = {
    low: { label: "Low Threat", color: "var(--bank-risk-low)", bg: "var(--bank-risk-low-bg)", icon: ShieldCheck },
    medium: { label: "Medium Threat", color: "var(--bank-risk-medium)", bg: "var(--bank-risk-medium-bg)", icon: AlertTriangle },
    high: { label: "High Threat", color: "var(--bank-risk-high)", bg: "var(--bank-risk-high-bg)", icon: ShieldAlert },
  }[threatLevel];
  const ThreatIcon = thr.icon;

  const circumference = 2 * Math.PI * 40;

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--bank-text)]">Welcome back, {user?.name}</h1>
          <p className="text-[var(--bank-text-muted)] mt-1">Manage your account, security, and activity</p>
        </motion.div>

        {/* ── Security Banner ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bank-card-gradient p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Score Ring */}
            <div className="relative flex-shrink-0" style={{ width: 96, height: 96 }}>
              <svg width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                <motion.circle
                  cx="48" cy="48" r="40" fill="none"
                  stroke={thr.color}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference * (1 - securityScore / 100) }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{securityScore}%</span>
                <span className="text-[10px] text-white/60 font-medium">SECURE</span>
              </div>
            </div>
            {/* Info */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">Security Score</h3>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: thr.bg, color: thr.color }}
              >
                <ThreatIcon className="w-3.5 h-3.5" />{thr.label}
              </span>
              <p className="text-white/60 text-sm mt-2">
                {securityScore >= 80 ? "Your account is well protected." : securityScore >= 50 ? "Some security measures need attention." : "Critical security improvements needed."}
              </p>
            </div>
            {/* Mini Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
              <MiniStat icon={<Monitor className="w-4 h-4" />} label="Devices" value={user?.trustedDevices?.length || 0} />
              <MiniStat icon={<Globe className="w-4 h-4" />} label="IPs" value={user?.trustedIPs?.length || 0} />
              <MiniStat icon={<Lock className="w-4 h-4" />} label="MFA" value={user?.mfaEnabled ? "On" : "Off"} highlight={!user?.mfaEnabled} />
              <MiniStat icon={<AlertTriangle className="w-4 h-4" />} label="Risk" value={user?.riskScore || 0} highlight={(user?.riskScore || 0) >= 5} />
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Left Column ── */}
          <div className="space-y-6">
            {/* Profile Card */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bank-card-elevated p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--bank-primary)] to-[var(--bank-primary-light)] flex items-center justify-center shadow-lg">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--bank-text)]">{user?.name}</h3>
                  <p className="text-sm text-[var(--bank-text-muted)]">Account holder</p>
                </div>
              </div>
              <div className="space-y-2">
                <InfoRow icon={<Mail className="w-4 h-4 text-[var(--bank-primary)]" />} label="Email" value={user?.email} />
                <InfoRow icon={<Calendar className="w-4 h-4 text-[var(--bank-success)]" />} label="Member since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "—"} />
                <InfoRow icon={<Clock className="w-4 h-4 text-[var(--bank-primary)]" />} label="Last login" value={formatDate(user?.lastLogin)} />
                <InfoRow icon={<CreditCard className="w-4 h-4 text-[var(--bank-accent)]" />} label="Account No." value={user?.accountNumber || "—"} mono />
              </div>
              <div className="mt-5 pt-5 border-t border-[var(--bank-border)]">
                <Link to="/profile" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 btn-bank-primary rounded-lg text-sm">
                  <Settings className="w-4 h-4" /> Edit Profile <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="bank-card-elevated p-6">
              <h3 className="font-bold text-[var(--bank-text)] mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[var(--bank-primary)]" /> Quick Actions
              </h3>
              <div className="space-y-2">
                <QuickLink to="/service" icon={<CreditCard className="w-5 h-5 text-[var(--bank-success)]" />} label="Banking Services" sub="Security · Manage" bgColor="bg-emerald-50" />
                <QuickLink to="/transactions" icon={<DollarSign className="w-5 h-5 text-[var(--bank-primary)]" />} label="Transfer Money" sub="Send securely" bgColor="bg-blue-50" />
                <QuickLink to="/transaction-history" icon={<TrendingUp className="w-5 h-5 text-[var(--bank-cyber-purple)]" />} label="Transaction History" sub="View all" bgColor="bg-purple-50" />
                <QuickLink to="/service" icon={<Fingerprint className="w-5 h-5 text-[var(--bank-cyber-blue)]" />} label="Login Activity" sub="Monitor logins" bgColor="bg-sky-50" />
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bank-card p-5 border-[var(--bank-error)]/25"
            >
              <h3 className="font-bold text-[var(--bank-error)] mb-1 flex items-center gap-2 text-sm">
                <Trash2 className="w-4 h-4" /> Danger Zone
              </h3>
              <p className="text-xs text-[var(--bank-text-muted)] mb-3">Permanently delete your account and all data.</p>
              <button onClick={handleDeleteAccount} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bank-error)] text-white font-medium text-sm hover:opacity-90 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" /> Delete Account
              </button>
            </motion.div>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Overview */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bank-card-elevated p-6">
              <h3 className="font-bold text-[var(--bank-text)] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--bank-primary)]" /> Account Overview
              </h3>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--bank-bg)] to-white border border-[var(--bank-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--bank-primary)] to-[var(--bank-primary-light)] flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--bank-text-muted)]">Balance</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-[var(--bank-text)]">
                          {showBalance ? `₹${(currentBalance ?? user?.balance ?? 0).toLocaleString()}` : "••••••"}
                        </p>
                        <button onClick={() => setShowBalance(!showBalance)} className="p-0.5 rounded hover:bg-[var(--bank-border)]">
                          {showBalance ? <EyeOff className="w-3.5 h-3.5 text-[var(--bank-text-muted)]" /> : <Eye className="w-3.5 h-3.5 text-[var(--bank-text-muted)]" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--bank-bg)] to-white border border-[var(--bank-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--bank-success)] to-emerald-400 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--bank-text-muted)]">Account</p>
                      <p className="font-bold text-[var(--bank-text)] font-mono text-sm">{user?.accountNumber ?? "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--bank-bg)] to-white border border-[var(--bank-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--bank-cyber-blue)] to-blue-400 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--bank-text-muted)]">Status</p>
                      <p className="font-bold text-[var(--bank-success)]">Active</p>
                    </div>
                  </div>
                </div>
              </div>

              {txnStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[var(--bank-border)]">
                  <StatBox icon={<ArrowUpRight className="w-3 h-3" />} label="Sent (30d)" value={`₹${(txnStats.outgoing?.recentTotal || 0).toLocaleString()}`} sub={`${txnStats.outgoing?.recentCount || 0} txns`} />
                  <StatBox icon={<ArrowDownLeft className="w-3 h-3" />} label="Received (30d)" value={`₹${(txnStats.incoming?.recentTotal || 0).toLocaleString()}`} sub={`${txnStats.incoming?.recentCount || 0} txns`} />
                  <StatBox label="Total Sent" value={`₹${(txnStats.outgoing?.total || 0).toLocaleString()}`} />
                  <StatBox label="Net Flow" value={`${(txnStats.netFlow || 0) >= 0 ? "+" : ""}₹${Math.abs(txnStats.netFlow || 0).toLocaleString()}`} color={(txnStats.netFlow || 0) >= 0 ? "var(--bank-success)" : "var(--bank-error)"} />
                </div>
              )}
            </motion.div>

            {/* Recent Transactions */}
            {recentTxns.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bank-card-elevated p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[var(--bank-text)] flex items-center gap-2">
                    <History className="w-5 h-5 text-[var(--bank-primary)]" /> Recent Transactions
                  </h3>
                  <Link to="/transaction-history" className="text-sm text-[var(--bank-primary)] font-medium flex items-center gap-1 hover:underline">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="space-y-1">
                  {recentTxns.map((t) => (
                    <div key={t._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bank-bg)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4 text-[var(--bank-error)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--bank-text)] text-sm">{t.recipient}</p>
                          <p className="text-xs text-[var(--bank-text-subtle)]">{formatDate(t.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[var(--bank-error)] text-sm">−₹{t.amount?.toLocaleString()}</p>
                        <span className={`text-xs font-medium ${t.status?.includes("Success") ? "text-[var(--bank-success)]" : "text-[var(--bank-error)]"}`}>
                          {t.status?.includes("Success") ? "✓ Success" : "✗ Failed"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Security Activity Logs */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bank-card-elevated p-6">
              <h3 className="font-bold text-[var(--bank-text)] mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[var(--bank-primary)]" /> Security Activity Logs
              </h3>
              <ContextLogTable logs={user?.contextLogs} />
            </motion.div>

            {/* Login History */}
            {user?.loginHistory?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bank-card-elevated p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[var(--bank-text)] flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-[var(--bank-cyber-blue)]" /> Login History
                  </h3>
                  <Link to="/service" className="text-sm text-[var(--bank-primary)] font-medium hover:underline">View all</Link>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {user.loginHistory.slice(-8).reverse().map((entry, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bank-bg)] border border-[var(--bank-border)]">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${entry.successful ? "bg-emerald-50" : "bg-red-50"}`}>
                          {entry.successful ? <CheckCircle className="w-4 h-4 text-[var(--bank-success)]" /> : <XCircle className="w-4 h-4 text-[var(--bank-error)]" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--bank-text)]">{entry.ip || "Unknown IP"}</p>
                          <p className="text-xs text-[var(--bank-text-subtle)] truncate max-w-[220px]">{entry.userAgent || "Unknown"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--bank-text-muted)]">{entry.date ? formatDate(entry.date) : "—"}</p>
                        <p className="text-xs text-[var(--bank-text-subtle)]">{entry.location || ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Context Status */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <ContextStatus context={context} userProfile={user} />
            </motion.div>

            {/* Security Recommendations */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bank-card-cyber p-6">
              <h3 className="font-bold text-[var(--bank-text)] mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[var(--bank-warning)]" /> Security Recommendations
              </h3>
              <div className="space-y-2">
                <RecItem done={user?.isVerified} label="Email Verification" desc="Verify your email to secure your account" />
                <RecItem done={user?.mfaEnabled} label="Two-Factor Authentication" desc="Enable 2FA for extra login security" />
                <RecItem done={(user?.trustedDevices?.length || 0) > 0} label="Device Trust" desc="Your device has been registered as trusted" />
                <RecItem done={(user?.riskScore || 0) < 5} label="Low Risk Profile" desc="Maintain normal usage to keep risk low" />
                <RecItem done={(user?.failedLoginAttempts || 0) === 0} label="No Failed Logins" desc="No recent failed login attempts" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Subcomponents ── */
const MiniStat = ({ icon, label, value, highlight }) => (
  <div className="px-3 py-2.5 rounded-xl bg-white/10 backdrop-blur text-center min-w-[70px]">
    <div className="flex items-center justify-center mb-1 text-white/60">{icon}</div>
    <p className={`font-bold text-sm ${highlight ? "text-[var(--bank-warning)]" : "text-white"}`}>{value}</p>
    <p className="text-[10px] text-white/50 font-medium">{label}</p>
  </div>
);

const InfoRow = ({ icon, label, value, mono }) => (
  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bank-bg)]">
    {icon}
    <div className="min-w-0 flex-1">
      <p className="text-[10px] text-[var(--bank-text-subtle)] uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-medium text-[var(--bank-text)] truncate ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  </div>
);

const QuickLink = ({ to, icon, label, sub, bgColor }) => (
  <Link to={to} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--bank-border)] hover:border-[var(--bank-primary)]/40 hover:shadow-sm transition-all">
    <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-[var(--bank-text)] text-sm">{label}</p>
      <p className="text-xs text-[var(--bank-text-subtle)]">{sub}</p>
    </div>
    <ArrowRight className="w-4 h-4 text-[var(--bank-text-subtle)]" />
  </Link>
);

const StatBox = ({ icon, label, value, sub, color }) => (
  <div className="p-3 rounded-xl bg-[var(--bank-bg)]">
    <p className="text-xs text-[var(--bank-text-muted)] flex items-center gap-1">{icon}{label}</p>
    <p className="font-bold text-[var(--bank-text)]" style={color ? { color } : {}}>{value}</p>
    {sub && <p className="text-xs text-[var(--bank-text-subtle)]">{sub}</p>}
  </div>
);

const RecItem = ({ done, label, desc }) => (
  <div className={`flex items-start gap-3 p-3 rounded-xl border ${done ? "bg-emerald-50/50 border-emerald-200/50" : "bg-amber-50/50 border-amber-200/50"}`}>
    {done ? <CheckCircle className="w-5 h-5 text-[var(--bank-success)] shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-[var(--bank-warning)] shrink-0 mt-0.5" />}
    <div>
      <p className="font-medium text-[var(--bank-text)] text-sm">{label}</p>
      <p className="text-xs text-[var(--bank-text-muted)]">{desc}</p>
    </div>
  </div>
);

export default DashboardPage;
