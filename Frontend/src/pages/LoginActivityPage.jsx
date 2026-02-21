import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import {
  Shield, Clock, Globe, Monitor, MapPin, CheckCircle, XCircle,
  ArrowLeft, RefreshCw, AlertTriangle, Fingerprint,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/date";

const LoginActivityPage = () => {
  const { user } = useAuthStore();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Use user's loginHistory from auth store first, fallback to API
    if (user?.loginHistory?.length > 0) {
      setActivity([...user.loginHistory].reverse());
      setLoading(false);
    } else {
      fetch("/api/profile/login-activity", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setActivity(data.loginHistory || []);
          else setError(data.message || "Failed to load activity");
        })
        .catch(() => {
          // If API fails, try from user object
          if (user?.loginHistory) setActivity([...user.loginHistory].reverse());
          else setError("Unable to retrieve login activity");
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const successCount = activity.filter((a) => a.successful).length;
  const failedCount = activity.filter((a) => !a.successful).length;

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-[var(--bank-primary)] font-medium mb-4 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--bank-primary)] flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--bank-text)]">Login Activity</h1>
              <p className="text-[var(--bank-text-muted)] text-sm">Monitor all authentication events for your account</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-[var(--bank-error-bg)] text-[var(--bank-error)] mb-6">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bank-stat-card text-center">
            <p className="text-2xl font-bold text-[var(--bank-text)]">{activity.length}</p>
            <p className="text-xs text-[var(--bank-text-muted)]">Total Logins</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bank-stat-card text-center">
            <p className="text-2xl font-bold text-[var(--bank-success)]">{successCount}</p>
            <p className="text-xs text-[var(--bank-text-muted)]">Successful</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bank-stat-card text-center">
            <p className="text-2xl font-bold text-[var(--bank-error)]">{failedCount}</p>
            <p className="text-xs text-[var(--bank-text-muted)]">Failed</p>
          </motion.div>
        </div>

        {/* Activity List */}
        {loading ? (
          <div className="bank-card-elevated p-10 text-center">
            <div className="w-8 h-8 border-2 border-[var(--bank-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--bank-text-muted)]">Loading login activity…</p>
          </div>
        ) : activity.length === 0 ? (
          <div className="bank-card-elevated p-10 text-center">
            <Shield className="w-12 h-12 text-[var(--bank-text-subtle)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--bank-text)] mb-2">No login history</h3>
            <p className="text-[var(--bank-text-muted)]">Your login activity will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bank-card-elevated p-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.successful ? "bg-green-50" : "bg-red-50"}`}>
                    {item.successful ? (
                      <CheckCircle className="w-5 h-5 text-[var(--bank-success)]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-[var(--bank-error)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold text-sm ${item.successful ? "text-[var(--bank-success)]" : "text-[var(--bank-error)]"}`}>
                        {item.successful ? "Successful Login" : "Failed Login Attempt"}
                      </span>
                      <span className="text-xs text-[var(--bank-text-muted)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.date ? formatDate(item.date) : "—"}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-2">
                      <div className="flex items-center gap-2 text-sm text-[var(--bank-text)]">
                        <Globe className="w-4 h-4 text-[var(--bank-text-subtle)]" />
                        <span className="font-mono text-xs">{item.ip || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--bank-text)]">
                        <MapPin className="w-4 h-4 text-[var(--bank-text-subtle)]" />
                        <span className="text-xs truncate">{item.location || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--bank-text)]">
                        <Monitor className="w-4 h-4 text-[var(--bank-text-subtle)]" />
                        <span className="text-xs truncate max-w-[200px]">{item.userAgent || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginActivityPage;
