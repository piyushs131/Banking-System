import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Shield, Lock, Unlock, Monitor, Globe, MapPin, Fingerprint,
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, XCircle,
  Key, Smartphone, Eye, EyeOff, FileText, Download, History,
  Bell, ArrowLeft, ArrowRight, Settings, Activity, Trash2,
  RefreshCw, Plus, Clock, Zap, CreditCard, DollarSign,
  Users, Building, Server,
} from "lucide-react";
import { formatDate } from "../utils/date";
import { Link } from "react-router-dom";

const ServicePage = () => {
  const { user, checkAuth } = useAuthStore();
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- 2FA State ---
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);

  // --- Trusted Devices/IPs ---
  const [trustedDevices, setTrustedDevices] = useState(user?.trustedDevices || []);
  const [trustedIPs, setTrustedIPs] = useState(user?.trustedIPs || []);

  // --- Login Activity ---
  const [loginHistory, setLoginHistory] = useState([]);

  // --- Statement download ---
  const [downloading, setDownloading] = useState(false);

  // --- Service Request form ---
  const [serviceForm, setServiceForm] = useState({ fullName: "", email: "", phone: "", dateOfBirth: "", address: "", occupation: "" });
  const [selectedBankingService, setSelectedBankingService] = useState(null);

  useEffect(() => {
    setMfaEnabled(user?.mfaEnabled || false);
    setTrustedDevices(user?.trustedDevices || []);
    setTrustedIPs(user?.trustedIPs || []);
    setLoginHistory((user?.loginHistory || []).slice().reverse().slice(0, 20));
  }, [user]);

  // Toggle 2FA — use cookie auth (withCredentials), NOT Authorization header
  const toggleMFA = async () => {
    setLoading(true);
    try {
      await axios.post("/api/auth/toggle-mfa", {}, { withCredentials: true });
      setMfaEnabled(!mfaEnabled);
      await checkAuth();
      toast.success(mfaEnabled ? "2FA disabled" : "2FA enabled");
    } catch (err) {
      console.error("Toggle MFA error:", err);
      toast.error(err?.response?.data?.message || "Failed to toggle 2FA");
    } finally {
      setLoading(false);
    }
  };

  // Add current device/IP to trusted — use cookie auth
  const addCurrentDevice = async () => {
    setLoading(true);
    try {
      await axios.post("/api/auth/trust-device", {}, { withCredentials: true });
      await checkAuth();
      toast.success("Current device added to trusted list");
    } catch (err) {
      console.error("Trust device error:", err);
      toast.error(err?.response?.data?.message || "Failed to add device");
    } finally {
      setLoading(false);
    }
  };

  const addCurrentIP = async () => {
    setLoading(true);
    try {
      await axios.post("/api/auth/trust-ip", {}, { withCredentials: true });
      await checkAuth();
      toast.success("Current IP added to trusted list");
    } catch (err) {
      console.error("Trust IP error:", err);
      toast.error(err?.response?.data?.message || "Failed to add IP");
    } finally {
      setLoading(false);
    }
  };

  // Remove trusted device/IP — use cookie auth
  const removeDevice = async (device) => {
    try {
      await axios.post("/api/auth/remove-trusted-device", { device }, { withCredentials: true });
      await checkAuth();
      toast.success("Device removed");
    } catch { toast.error("Failed to remove device"); }
  };

  const removeIP = async (ip) => {
    try {
      await axios.post("/api/auth/remove-trusted-ip", { ip }, { withCredentials: true });
      await checkAuth();
      toast.success("IP removed");
    } catch { toast.error("Failed to remove IP"); }
  };

  // Download statement as CSV (generated client-side from transactions)
  const downloadStatement = async () => {
    setDownloading(true);
    try {
      const res = await axios.get("/api/transactions", { withCredentials: true });
      const transactions = Array.isArray(res.data) ? res.data : (res.data?.transactions || []);

      if (transactions.length === 0) {
        toast.error("No transactions to download");
        setDownloading(false);
        return;
      }

      // Build CSV
      const headers = ["Date", "Recipient", "Account Number", "Amount (₹)", "Purpose", "Note", "Status", "Chain Status", "TX Hash"];
      const rows = transactions.map(t => [
        t.date ? new Date(t.date).toLocaleString("en-IN") : "—",
        t.recipient || "—",
        t.accountNumber || "—",
        t.amount || 0,
        t.purpose || "—",
        t.note || "—",
        t.status || "—",
        t.chainStatus || "OffChain",
        t.txHash || "N/A",
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `statement_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Statement downloaded successfully");
    } catch (err) {
      console.error("Statement download error:", err);
      toast.error("Failed to download statement");
    } finally {
      setDownloading(false);
    }
  };

  // Submit service request
  const submitServiceRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/service-requests", { ...serviceForm, service: selectedBankingService }, { withCredentials: true });
      if (res.data.success) {
        toast.success("Request submitted successfully");
        setServiceForm({ fullName: "", email: "", phone: "", dateOfBirth: "", address: "", occupation: "" });
        setSelectedBankingService(null);
        setActiveSection(null);
      } else {
        toast.error(res.data.error || "Submission failed");
      }
    } catch { toast.error("Server error"); }
  };

  /* Security score */
  const securityScore = (() => {
    let s = 0, t = 0;
    t += 20; if (user?.mfaEnabled) s += 20;
    t += 20; if (user?.isVerified) s += 20;
    t += 15; if (trustedDevices.length > 0) s += 15;
    t += 15; if (trustedIPs.length > 0) s += 15;
    t += 15; if ((user?.riskScore || 0) < 5) s += 15;
    t += 15; if ((user?.failedLoginAttempts || 0) === 0) s += 15;
    return t > 0 ? Math.round((s / t) * 100) : 0;
  })();

  const services = [
    {
      id: "security",
      icon: Shield,
      label: "Security Center",
      description: "2FA, trusted devices, IP management, and security settings",
      color: "from-blue-600 to-indigo-600",
      bgLight: "bg-blue-50",
    },
    {
      id: "devices",
      icon: Monitor,
      label: "Device Management",
      description: "View and manage your trusted devices and sessions",
      color: "from-violet-600 to-purple-600",
      bgLight: "bg-violet-50",
    },
    {
      id: "network",
      icon: Globe,
      label: "Network Security",
      description: "Manage trusted IP addresses and network access",
      color: "from-cyan-600 to-teal-600",
      bgLight: "bg-cyan-50",
    },
    {
      id: "activity",
      icon: Activity,
      label: "Login Activity",
      description: "Monitor all login attempts and access history",
      color: "from-emerald-600 to-green-600",
      bgLight: "bg-emerald-50",
    },
    {
      id: "statement",
      icon: FileText,
      label: "Account Statement",
      description: "Download your transaction statement as CSV",
      color: "from-amber-600 to-orange-600",
      bgLight: "bg-amber-50",
    },
    {
      id: "banking",
      icon: CreditCard,
      label: "Banking Services",
      description: "Apply for financial services, loans, and more",
      color: "from-rose-600 to-pink-600",
      bgLight: "bg-rose-50",
    },
  ];

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--bank-primary)] to-[var(--bank-primary-light)] flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--bank-text)]">Services & Security</h1>
              <p className="text-sm text-[var(--bank-text-muted)]">Manage security settings, devices, and banking services</p>
            </div>
          </div>
        </motion.div>

        {/* Security Score Bar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bank-card-gradient p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-white" />
              <div>
                <p className="font-bold text-white">Account Security Score</p>
                <p className="text-xs text-white/60">
                  {securityScore >= 80 ? "Your account is well protected" : securityScore >= 50 ? "Some improvements needed" : "Critical: improve your security"}
                </p>
              </div>
            </div>
            <span className="text-3xl font-bold text-white">{securityScore}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: securityScore >= 80 ? "var(--bank-risk-low)" : securityScore >= 50 ? "var(--bank-risk-medium)" : "var(--bank-risk-high)" }}
              initial={{ width: 0 }}
              animate={{ width: `${securityScore}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <div className="flex gap-4 mt-3 text-xs text-white/50">
            <span className="flex items-center gap-1">{user?.isVerified ? <CheckCircle className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-red-400" />} Email</span>
            <span className="flex items-center gap-1">{user?.mfaEnabled ? <CheckCircle className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-red-400" />} 2FA</span>
            <span className="flex items-center gap-1">{trustedDevices.length > 0 ? <CheckCircle className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-red-400" />} Devices</span>
            <span className="flex items-center gap-1">{trustedIPs.length > 0 ? <CheckCircle className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-red-400" />} IPs</span>
          </div>
        </motion.div>

        {/* Service Grid */}
        <AnimatePresence mode="wait">
          {!activeSection ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {services.map(({ id, icon: Icon, label, description, color, bgLight }, i) => (
                <motion.button
                  key={id} type="button"
                  onClick={() => setActiveSection(id)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="service-card text-left group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-[var(--bank-text)]">{label}</span>
                  </div>
                  <p className="text-sm text-[var(--bank-text-muted)] mb-4">{description}</p>
                  <div className="flex justify-end">
                    <ArrowRight className="w-5 h-5 text-[var(--bank-text-subtle)] group-hover:text-[var(--bank-primary)] group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div key="panel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-sm text-[var(--bank-primary)] font-medium mb-4 hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to Services
              </button>

              {/* Security Center */}
              {activeSection === "security" && (
                <div className="space-y-5">
                  <SectionHeader icon={Shield} label="Security Center" sub="Manage your account security settings" />

                  {/* 2FA Toggle */}
                  <div className="bank-card-elevated p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                          <Key className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[var(--bank-text)]">Two-Factor Authentication (2FA)</h4>
                          <p className="text-sm text-[var(--bank-text-muted)]">Require email verification code on every login</p>
                        </div>
                      </div>
                      <button onClick={toggleMFA} disabled={loading}
                        className={`bank-toggle ${mfaEnabled ? "bank-toggle-on" : "bank-toggle-off"}`}
                      >
                        <div className="bank-toggle-dot" />
                      </button>
                    </div>
                    <div className={`mt-4 p-3 rounded-xl text-sm ${mfaEnabled ? "bg-emerald-50 text-[var(--bank-success)]" : "bg-amber-50 text-[var(--bank-warning)]"}`}>
                      {mfaEnabled
                        ? "✓ 2FA is enabled. A verification code will be sent to your email on each login."
                        : "⚠ 2FA is disabled. Enable it to add an extra layer of security."}
                    </div>
                  </div>

                  {/* Email Verification */}
                  <div className="bank-card-elevated p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${user?.isVerified ? "bg-emerald-100" : "bg-red-100"}`}>
                        {user?.isVerified ? <CheckCircle className="w-6 h-6 text-[var(--bank-success)]" /> : <XCircle className="w-6 h-6 text-[var(--bank-error)]" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--bank-text)]">Email Verification</h4>
                        <p className="text-sm text-[var(--bank-text-muted)]">
                          {user?.isVerified ? "Your email is verified" : "Your email is not verified — verify it for full security"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Risk Score */}
                  <div className="bank-card-elevated p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[var(--bank-text)]">Risk Score: {user?.riskScore || 0}/10</h4>
                        <p className="text-sm text-[var(--bank-text-muted)]">Based on login patterns, devices, and behavioral analysis</p>
                        <div className="mt-2 risk-meter">
                          <div className="risk-meter-fill" style={{
                            width: `${Math.min(((user?.riskScore || 0) / 10) * 100, 100)}%`,
                            background: (user?.riskScore || 0) < 3 ? "var(--bank-risk-low)" : (user?.riskScore || 0) < 6 ? "var(--bank-risk-medium)" : "var(--bank-risk-high)"
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Failed Login Attempts */}
                  <div className="bank-card-elevated p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${(user?.failedLoginAttempts || 0) === 0 ? "bg-emerald-100" : "bg-red-100"}`}>
                        <Lock className={`w-6 h-6 ${(user?.failedLoginAttempts || 0) === 0 ? "text-[var(--bank-success)]" : "text-[var(--bank-error)]"}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[var(--bank-text)]">Failed Login Attempts: {user?.failedLoginAttempts || 0}</h4>
                        <p className="text-sm text-[var(--bank-text-muted)]">
                          {(user?.failedLoginAttempts || 0) === 0 ? "No failed logins. Your account is secure." : "Failed attempts detected. Monitor for unauthorized access."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Device Management */}
              {activeSection === "devices" && (
                <div className="space-y-5">
                  <SectionHeader icon={Monitor} label="Device Management" sub="View and manage trusted devices" />

                  <div className="bank-card-elevated p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-[var(--bank-text)]">Trusted Devices ({trustedDevices.length})</h4>
                      <button onClick={addCurrentDevice} disabled={loading} className="btn-bank-security text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Trust This Device
                      </button>
                    </div>

                    {trustedDevices.length === 0 ? (
                      <div className="text-center py-10">
                        <Monitor className="w-12 h-12 mx-auto text-[var(--bank-text-subtle)] mb-3" />
                        <p className="font-medium text-[var(--bank-text)]">No trusted devices</p>
                        <p className="text-sm text-[var(--bank-text-muted)] mt-1">Add your current device to reduce risk flags</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {trustedDevices.map((d, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bank-bg)] border border-[var(--bank-border)]">
                            <div className="flex items-center gap-3">
                              <Smartphone className="w-5 h-5 text-[var(--bank-primary)]" />
                              <span className="text-sm text-[var(--bank-text)] truncate max-w-[300px]">{d}</span>
                            </div>
                            <button onClick={() => removeDevice(d)} className="p-2 rounded-lg text-[var(--bank-text-muted)] hover:text-[var(--bank-error)] hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Network Security */}
              {activeSection === "network" && (
                <div className="space-y-5">
                  <SectionHeader icon={Globe} label="Network Security" sub="Manage trusted IP addresses" />

                  <div className="bank-card-elevated p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-[var(--bank-text)]">Trusted IP Addresses ({trustedIPs.length})</h4>
                      <button onClick={addCurrentIP} disabled={loading} className="btn-bank-security text-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Trust Current IP
                      </button>
                    </div>

                    {trustedIPs.length === 0 ? (
                      <div className="text-center py-10">
                        <Globe className="w-12 h-12 mx-auto text-[var(--bank-text-subtle)] mb-3" />
                        <p className="font-medium text-[var(--bank-text)]">No trusted IPs</p>
                        <p className="text-sm text-[var(--bank-text-muted)] mt-1">Add your current IP to avoid security alerts</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {trustedIPs.map((ip, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bank-bg)] border border-[var(--bank-border)]">
                            <div className="flex items-center gap-3">
                              <Globe className="w-5 h-5 text-[var(--bank-cyber-blue)]" />
                              <span className="text-sm font-mono text-[var(--bank-text)]">{ip}</span>
                            </div>
                            <button onClick={() => removeIP(ip)} className="p-2 rounded-lg text-[var(--bank-text-muted)] hover:text-[var(--bank-error)] hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bank-card p-4 border-amber-200 bg-amber-50/50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[var(--bank-warning)] mt-0.5" />
                      <div className="text-sm text-[var(--bank-text-muted)]">
                        <p className="font-medium text-[var(--bank-text)] mb-1">Why add trusted IPs?</p>
                        <p>When you transact from an untrusted IP, the system flags it as a risk factor. Adding your home/office IP reduces false positives and improves your security score.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Login Activity */}
              {activeSection === "activity" && (
                <div className="space-y-5">
                  <SectionHeader icon={Activity} label="Login Activity" sub="All authentication events" />

                  <div className="grid grid-cols-3 gap-4 mb-2">
                    <div className="bank-stat-card text-center">
                      <p className="text-2xl font-bold text-[var(--bank-text)]">{loginHistory.length}</p>
                      <p className="text-xs text-[var(--bank-text-muted)]">Total</p>
                    </div>
                    <div className="bank-stat-card text-center">
                      <p className="text-2xl font-bold text-[var(--bank-success)]">{loginHistory.filter(l => l.successful !== false).length}</p>
                      <p className="text-xs text-[var(--bank-text-muted)]">Success</p>
                    </div>
                    <div className="bank-stat-card text-center">
                      <p className="text-2xl font-bold text-[var(--bank-error)]">{loginHistory.filter(l => l.successful === false).length}</p>
                      <p className="text-xs text-[var(--bank-text-muted)]">Failed</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {loginHistory.length === 0 ? (
                      <div className="bank-card-elevated p-10 text-center">
                        <History className="w-12 h-12 mx-auto text-[var(--bank-text-subtle)] mb-3" />
                        <p className="text-[var(--bank-text-muted)]">No login history available yet</p>
                        <p className="text-xs text-[var(--bank-text-subtle)] mt-1">Login history will appear after your next login</p>
                      </div>
                    ) : loginHistory.map((entry, i) => (
                      <div key={i} className="bank-card-elevated p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${entry.successful !== false ? "bg-emerald-50" : "bg-red-50"}`}>
                            {entry.successful !== false ? <CheckCircle className="w-4 h-4 text-[var(--bank-success)]" /> : <XCircle className="w-4 h-4 text-[var(--bank-error)]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-semibold ${entry.successful !== false ? "text-[var(--bank-success)]" : "text-[var(--bank-error)]"}`}>
                                {entry.successful !== false ? "Successful Login" : "Failed Attempt"}
                              </span>
                              <span className="text-xs text-[var(--bank-text-muted)]">{entry.date ? formatDate(entry.date) : "—"}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-[var(--bank-text-subtle)]">
                              <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{entry.ip || "—"}</span>
                              <span className="flex items-center gap-1 truncate max-w-[200px]"><Monitor className="w-3 h-3" />{entry.userAgent ? entry.userAgent.slice(0, 50) : "—"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statement */}
              {activeSection === "statement" && (
                <div className="space-y-5">
                  <SectionHeader icon={FileText} label="Account Statement" sub="Download your transaction history" />
                  <div className="bank-card-elevated p-8 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-[var(--bank-text)] mb-2">Download Statement</h4>
                    <p className="text-sm text-[var(--bank-text-muted)] mb-6 max-w-md mx-auto">
                      Generate and download a CSV statement of all your transactions. Includes sender, recipient, amount, date, and blockchain verification status.
                    </p>
                    <button onClick={downloadStatement} disabled={downloading} className="btn-bank-accent flex items-center gap-2 mx-auto">
                      {downloading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                      {downloading ? "Generating…" : "Download CSV Statement"}
                    </button>
                  </div>
                </div>
              )}

              {/* Banking Services */}
              {activeSection === "banking" && (
                <div className="space-y-5">
                  <SectionHeader icon={CreditCard} label="Banking Services" sub="Apply for financial services" />

                  {!selectedBankingService ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { icon: CreditCard, label: "Payments", desc: "Secure payments with fraud detection and real-time monitoring." },
                        { icon: DollarSign, label: "Finance", desc: "Loans, investments and wealth management with AI insights." },
                        { icon: Shield, label: "Security", desc: "Biometric auth, encryption and 24/7 fraud monitoring." },
                        { icon: Zap, label: "Growth", desc: "Business growth, market analysis and expansion planning." },
                        { icon: Users, label: "Customers", desc: "CRM, support and personalised banking experiences." },
                        { icon: Building, label: "Enterprise", desc: "Corporate banking with custom integration and support." },
                      ].map(({ icon: Icon, label, desc }) => (
                        <button key={label} type="button" onClick={() => setSelectedBankingService(label)}
                          className="service-card text-left"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--bank-primary)] flex items-center justify-center">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-semibold text-[var(--bank-text)]">{label}</span>
                          </div>
                          <p className="text-sm text-[var(--bank-text-muted)]">{desc}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bank-card-elevated p-6 max-w-xl">
                      <h4 className="text-lg font-bold text-[var(--bank-text)] mb-5">
                        Apply for: <span className="text-[var(--bank-primary)]">{selectedBankingService}</span>
                      </h4>
                      <form onSubmit={submitServiceRequest} className="space-y-4">
                        {[
                          { name: "fullName", label: "Full Name", type: "text", ph: "Your full name" },
                          { name: "email", label: "Email", type: "email", ph: "you@email.com" },
                          { name: "phone", label: "Phone", type: "tel", ph: "Phone number" },
                          { name: "dateOfBirth", label: "Date of Birth", type: "date" },
                          { name: "address", label: "Address", type: "text", ph: "Your address" },
                          { name: "occupation", label: "Occupation", type: "text", ph: "Job or business" },
                        ].map(({ name, label, type, ph }) => (
                          <div key={name}>
                            <label className="block text-sm font-medium text-[var(--bank-text)] mb-1">{label}</label>
                            <input type={type} name={name} value={serviceForm[name]} placeholder={ph}
                              onChange={(e) => setServiceForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                              className="bank-input" required
                            />
                          </div>
                        ))}
                        <div className="flex gap-3 pt-2">
                          <button type="button" onClick={() => setSelectedBankingService(null)} className="btn-bank-outline flex-1 sm:flex-none">Cancel</button>
                          <button type="submit" className="btn-bank-accent flex-1 sm:flex-none">Submit Request</button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, label, sub }) => (
  <div className="flex items-center gap-3 mb-2">
    <div className="w-10 h-10 rounded-xl bg-[var(--bank-primary)] flex items-center justify-center">
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-[var(--bank-text)]">{label}</h2>
      <p className="text-sm text-[var(--bank-text-muted)]">{sub}</p>
    </div>
  </div>
);

export default ServicePage;
