import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  LayoutDashboard, DollarSign, History, Briefcase, UserCircle,
  LogOut, Menu, X, Shield, ShieldCheck, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/transactions", icon: DollarSign, label: "Transfer" },
    { to: "/transaction-history", icon: History, label: "History" },
    { to: "/service", icon: Briefcase, label: "Services" },
    { to: "/profile", icon: UserCircle, label: "Profile" },
  ];

  const securityScore = (() => {
    let score = 0, total = 0;
    total += 20; if (user?.mfaEnabled) score += 20;
    total += 20; if (user?.isVerified) score += 20;
    total += 15; if (user?.trustedDevices?.length > 0) score += 15;
    total += 15; if (user?.trustedIPs?.length > 0) score += 15;
    total += 15; if ((user?.riskScore || 0) < 5) score += 15;
    total += 15; if ((user?.failedLoginAttempts || 0) === 0) score += 15;
    return total > 0 ? Math.round((score / total) * 100) : 0;
  })();

  const threatColor =
    securityScore >= 80 ? "var(--bank-risk-low)" :
      securityScore >= 50 ? "var(--bank-risk-medium)" :
        "var(--bank-risk-high)";

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bank-bg-elevated)]/95 backdrop-blur-md border-b border-[var(--bank-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[var(--bank-primary)] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-[var(--bank-text)]">SecureBank</span>
              <span className="block text-[10px] text-[var(--bank-text-muted)] -mt-1 tracking-wide">CYBERSECURITY BANKING</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(to)
                    ? "bg-[var(--bank-primary)] text-white"
                    : "text-[var(--bank-text-muted)] hover:bg-[var(--bank-bg)] hover:text-[var(--bank-text)]"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Security indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bank-bg)] border border-[var(--bank-border)]" title={`Security Score: ${securityScore}%`}>
              <div className="relative">
                <ShieldCheck className="w-4 h-4" style={{ color: threatColor }} />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full glow-green" style={{ background: threatColor }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: threatColor }}>{securityScore}%</span>
            </div>

            {/* User */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bank-bg)] border border-[var(--bank-border)]">
              <div className="w-6 h-6 rounded-full bg-[var(--bank-primary)] flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium text-[var(--bank-text)] max-w-[100px] truncate">{user?.name}</span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-[var(--bank-text-muted)] hover:bg-[var(--bank-error-bg)] hover:text-[var(--bank-error)] transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-[var(--bank-text-muted)] hover:bg-[var(--bank-bg)]"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-[var(--bank-border)] bg-[var(--bank-bg-elevated)]"
          >
            <div className="p-4 space-y-1">
              {/* Mobile security badge */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--bank-bg)] border border-[var(--bank-border)] mb-3">
                <ShieldCheck className="w-5 h-5" style={{ color: threatColor }} />
                <div>
                  <p className="text-sm font-medium text-[var(--bank-text)]">{user?.name}</p>
                  <p className="text-xs text-[var(--bank-text-muted)]">Security: {securityScore}%</p>
                </div>
              </div>
              {links.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(to)
                      ? "bg-[var(--bank-primary)] text-white"
                      : "text-[var(--bank-text-muted)] hover:bg-[var(--bank-bg)] hover:text-[var(--bank-text)]"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
