import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
  CheckCircle, XCircle, Calendar, User, CreditCard, Target,
  DollarSign, Search, RefreshCw, Download, ChevronLeft, ChevronRight,
  Shield, ShieldCheck, ShieldAlert, ExternalLink, X, ArrowUpRight,
  ArrowDownLeft, Clock, Hash, FileText, AlertTriangle, Eye, Filter,
  Building, Link2, Fingerprint, Activity, Lock, Unlock, Globe, Monitor,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "../utils/date";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const API_URL = "/api/transactions";

// Generate a display fingerprint from transaction data
const getFingerprint = (txn) => {
  const str = `${txn._id || ""}${txn.amount}${txn.date}${txn.recipient}${txn.accountNumber}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
};

// Determine risk level for a transaction
const getRiskLevel = (txn) => {
  if (!txn.status?.includes("Success")) return { level: "high", label: "Failed", color: "var(--bank-risk-high)", bg: "var(--bank-risk-high-bg)" };
  if (txn.amount > 100000) return { level: "high", label: "High Value", color: "var(--bank-risk-high)", bg: "var(--bank-risk-high-bg)" };
  if (txn.amount > 50000) return { level: "medium", label: "Elevated", color: "var(--bank-risk-medium)", bg: "var(--bank-risk-medium-bg)" };
  if (txn.chainStatus === "OnChain" && txn.validated) return { level: "verified", label: "Verified", color: "var(--bank-risk-low)", bg: "var(--bank-risk-low-bg)" };
  return { level: "low", label: "Normal", color: "var(--bank-risk-low)", bg: "var(--bank-risk-low-bg)" };
};

// ── TRANSACTION DETAIL MODAL ──
const TransactionDetailModal = ({ txn, onClose }) => {
  if (!txn) return null;
  const risk = getRiskLevel(txn);
  const fingerprint = getFingerprint(txn);
  const isSuccess = txn.status?.includes("Success");
  const isSent = txn.direction === "sent";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bank-modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bank-modal max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--bank-border)]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ background: `${risk.bg}` }}>
              {isSuccess ? <ShieldCheck className="w-5 h-5" style={{ color: risk.color }} /> : <ShieldAlert className="w-5 h-5" style={{ color: risk.color }} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--bank-text)]">Transaction Details</h2>
              <p className="text-xs text-[var(--bank-text-muted)]">Complete audit trail & security analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bank-bg)] transition-colors">
            <X className="w-5 h-5 text-[var(--bank-text-muted)]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Amount & Direction */}
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              {isSent ? (
                <ArrowUpRight className="w-6 h-6 text-[var(--bank-error)]" />
              ) : (
                <ArrowDownLeft className="w-6 h-6 text-[var(--bank-success)]" />
              )}
              <span className={`text-3xl font-bold ${isSent ? "text-[var(--bank-error)]" : "text-[var(--bank-success)]"}`}>
                {isSent ? "−" : "+"}₹{txn.amount?.toLocaleString()}
              </span>
            </div>
            <span className="security-badge" style={{ background: risk.bg, color: risk.color }}>
              {isSuccess ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {txn.status}
            </span>
          </div>

          {/* Core info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date & Time" value={formatDate(txn.date)} />
            <InfoRow icon={<User className="w-4 h-4" />} label={isSent ? "Recipient" : "Sender"} value={isSent ? txn.recipient : (txn.senderName || "—")} />
            <InfoRow icon={<CreditCard className="w-4 h-4" />} label="Account Number" value={isSent ? txn.accountNumber : (txn.senderAccount || txn.accountNumber)} mono />
            <InfoRow icon={<Building className="w-4 h-4" />} label="IFSC Code" value={txn.ifsc || "—"} mono />
            <InfoRow icon={<Target className="w-4 h-4" />} label="Purpose" value={txn.purpose || "—"} />
            <InfoRow icon={<FileText className="w-4 h-4" />} label="Note" value={txn.note || "None"} />
          </div>

          {/* Security Section */}
          <div className="border-t border-[var(--bank-border)] pt-4">
            <h3 className="text-sm font-semibold text-[var(--bank-text)] mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--bank-primary)]" />
              Security & Blockchain Audit
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow
                icon={<Fingerprint className="w-4 h-4" />}
                label="Transaction Fingerprint"
                value={fingerprint}
                mono
              />
              <InfoRow
                icon={<Activity className="w-4 h-4" />}
                label="Risk Assessment"
                value={risk.label}
                valueColor={risk.color}
              />
              <InfoRow
                icon={txn.chainStatus === "OnChain" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                label="Chain Status"
                value={txn.chainStatus || "OffChain"}
                valueColor={txn.chainStatus === "OnChain" ? "var(--bank-chain-on)" : "var(--bank-chain-off)"}
              />
              <InfoRow
                icon={<ShieldCheck className="w-4 h-4" />}
                label="Blockchain Validated"
                value={txn.validated ? "Yes – Verified" : "No – Not on chain"}
                valueColor={txn.validated ? "var(--bank-success)" : "var(--bank-text-muted)"}
              />
            </div>
          </div>

          {/* Blockchain Hash */}
          {txn.txHash && (
            <div className="border-t border-[var(--bank-border)] pt-4">
              <h3 className="text-sm font-semibold text-[var(--bank-text)] mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[var(--bank-cyber-blue)]" />
                Blockchain Record
              </h3>
              <div className="p-3 rounded-lg bg-[var(--bank-bg)] border border-[var(--bank-border)]">
                <p className="text-xs text-[var(--bank-text-muted)] mb-1">Transaction Hash</p>
                <p className="font-mono text-sm text-[var(--bank-text)] break-all">{txn.txHash}</p>
              </div>
            </div>
          )}

          {/* Transaction ID */}
          <div className="border-t border-[var(--bank-border)] pt-4">
            <div className="p-3 rounded-lg bg-[var(--bank-bg)] border border-[var(--bank-border)]">
              <p className="text-xs text-[var(--bank-text-muted)] mb-1">Internal Transaction ID</p>
              <p className="font-mono text-xs text-[var(--bank-text-subtle)] break-all">{txn._id}</p>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--bank-border)]">
          <button onClick={onClose} className="btn-bank-primary rounded-lg px-6 py-2.5">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const InfoRow = ({ icon, label, value, mono, valueColor }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bank-bg)]">
    <div className="text-[var(--bank-text-subtle)] mt-0.5">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-[var(--bank-text-muted)]">{label}</p>
      <p
        className={`text-sm font-medium break-all ${mono ? "font-mono" : ""}`}
        style={{ color: valueColor || "var(--bank-text)" }}
      >
        {value}
      </p>
    </div>
  </div>
);


// ── MAIN PAGE ──
export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [incomingTransactions, setIncomingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [activeTab, setActiveTab] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal
  const [selectedTxn, setSelectedTxn] = useState(null);

  // ── Fetch data ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      axios.defaults.withCredentials = true;
      const [outRes, inRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(`${API_URL}/incoming`).catch(() => ({ data: [] })),
      ]);
      setTransactions(Array.isArray(outRes.data) ? outRes.data : []);
      setIncomingTransactions(Array.isArray(inRes.data) ? inRes.data : []);
    } catch {
      setError("Failed to load transactions.");
      setTransactions([]);
      setIncomingTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Normalize for unified display ──
  const normalizedSent = useMemo(
    () => transactions.map((t) => ({ ...t, direction: "sent" })),
    [transactions]
  );
  const normalizedReceived = useMemo(
    () => incomingTransactions.map((t) => ({
      ...t,
      direction: "received",
      senderName: t.userId?.name || "Unknown",
      senderAccount: t.userId?.accountNumber || "—",
    })),
    [incomingTransactions]
  );
  const allTxns = useMemo(() => [...normalizedSent, ...normalizedReceived], [normalizedSent, normalizedReceived]);

  const sourceTxns = useMemo(() => {
    if (activeTab === "sent") return normalizedSent;
    if (activeTab === "received") return normalizedReceived;
    return allTxns;
  }, [activeTab, normalizedSent, normalizedReceived, allTxns]);

  // ── Filter & sort ──
  const filteredTxns = useMemo(() => {
    return sourceTxns
      .filter((txn) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
          txn.recipient?.toLowerCase().includes(term) ||
          txn.accountNumber?.includes(searchTerm) ||
          txn.purpose?.toLowerCase().includes(term) ||
          txn.senderName?.toLowerCase().includes(term) ||
          txn.txHash?.toLowerCase().includes(term);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "success" && txn.status?.includes("Success")) ||
          (statusFilter === "failed" && !txn.status?.includes("Success")) ||
          (statusFilter === "blockchain" && txn.chainStatus === "OnChain") ||
          (statusFilter === "verified" && txn.validated);

        const txDate = new Date(txn.date);
        const matchesFrom = !dateFrom || txDate >= new Date(dateFrom);
        const matchesTo = !dateTo || txDate <= new Date(dateTo + "T23:59:59");

        return matchesSearch && matchesStatus && matchesFrom && matchesTo;
      })
      .sort((a, b) => {
        if (sortBy === "date") return new Date(b.date) - new Date(a.date);
        if (sortBy === "amount") return b.amount - a.amount;
        if (sortBy === "recipient") return (a.recipient || "").localeCompare(b.recipient || "");
        if (sortBy === "status") return (a.status || "").localeCompare(b.status || "");
        return 0;
      });
  }, [sourceTxns, searchTerm, statusFilter, sortBy, dateFrom, dateTo]);

  // ── Pagination ──
  const totalPages = Math.ceil(filteredTxns.length / itemsPerPage);
  const paginatedTxns = filteredTxns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, sortBy, dateFrom, dateTo, activeTab]);

  // ── Stats ──
  const stats = useMemo(() => {
    const src = sourceTxns;
    const total = src.length;
    const successful = src.filter((t) => t.status?.includes("Success")).length;
    const failed = total - successful;
    const totalAmount = src.reduce((s, t) => s + (t.amount || 0), 0);
    const onChain = src.filter((t) => t.chainStatus === "OnChain").length;
    return { total, successful, failed, totalAmount, onChain };
  }, [sourceTxns]);

  // ── CSV Export ──
  const exportCSV = () => {
    const headers = ["Date", "Direction", "Recipient/Sender", "Account", "IFSC", "Purpose", "Amount", "Status", "Chain Status", "TX Hash", "Fingerprint"];
    const rows = filteredTxns.map((t) => [
      new Date(t.date).toISOString(),
      t.direction || "sent",
      t.direction === "received" ? t.senderName : t.recipient,
      t.accountNumber,
      t.ifsc || "",
      t.purpose,
      t.amount,
      t.status,
      t.chainStatus || "N/A",
      t.txHash || "",
      getFingerprint(t),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SecureBank_Transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transactions exported as CSV");
  };

  // ── Status badge ──
  const StatusBadge = ({ txn }) => {
    const isSuccess = txn.status?.includes("Success");
    return (
      <span className={`security-badge ${isSuccess ? "security-badge-success" : "security-badge-error"}`}>
        {isSuccess ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        {isSuccess ? "Success" : "Failed"}
      </span>
    );
  };

  const ChainBadge = ({ txn }) => {
    if (!txn.chainStatus || txn.chainStatus === "OffChain") {
      return <span className="security-badge security-badge-chain-off"><Unlock className="w-3 h-3" />Off-Chain</span>;
    }
    return <span className="security-badge security-badge-chain-on"><Lock className="w-3 h-3" />On-Chain</span>;
  };

  const RiskBadge = ({ txn }) => {
    const risk = getRiskLevel(txn);
    return (
      <span className="security-badge" style={{ background: risk.bg, color: risk.color }}>
        <Shield className="w-3 h-3" />
        {risk.label}
      </span>
    );
  };

  // ── Sub-components ──
  const LoadingSkeleton = () => (
    <div className="bank-card-elevated p-6 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="h-12 w-12 rounded-full bg-[var(--bank-border)]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 bg-[var(--bank-border)] rounded" />
            <div className="h-4 w-1/2 bg-[var(--bank-border)] rounded" />
          </div>
          <div className="h-6 w-24 bg-[var(--bank-border)] rounded" />
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
      <div className="w-20 h-20 rounded-full bg-[var(--bank-bg)] border border-[var(--bank-border)] flex items-center justify-center mx-auto mb-6">
        <Shield className="w-10 h-10 text-[var(--bank-text-subtle)]" />
      </div>
      <h3 className="text-xl font-semibold text-[var(--bank-text)] mb-2">No transactions yet</h3>
      <p className="text-[var(--bank-text-muted)] max-w-sm mx-auto mb-6">
        Your secure transaction history will appear here after you make transfers.
      </p>
      <Link to="/transactions" className="btn-bank-primary inline-flex items-center gap-2 px-6 py-3 rounded-lg">
        <DollarSign className="w-4 h-4" />
        Make a transfer
      </Link>
    </motion.div>
  );

  const ErrorState = () => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
      <div className="w-20 h-20 rounded-full bg-[var(--bank-error-bg)] flex items-center justify-center mx-auto mb-6">
        <ShieldAlert className="w-10 h-10 text-[var(--bank-error)]" />
      </div>
      <h3 className="text-xl font-semibold text-[var(--bank-text)] mb-2">Could not load transactions</h3>
      <p className="text-[var(--bank-text-muted)] mb-6">{error}</p>
      <button onClick={fetchData} className="btn-bank-primary inline-flex items-center gap-2 px-6 py-3 rounded-lg">
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>
    </motion.div>
  );

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-lg bg-[var(--bank-primary)] flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--bank-text)]">Transaction History</h1>
                <p className="text-[var(--bank-text-muted)] text-sm">Secure ledger with blockchain verification & risk analysis</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="btn-bank-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm" disabled={filteredTxns.length === 0}>
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button onClick={fetchData} className="p-2.5 rounded-lg bg-[var(--bank-primary)] text-white hover:opacity-90">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState />
        ) : allTxns.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {[
                { label: "Total", value: stats.total, icon: CreditCard, color: "var(--bank-primary)" },
                { label: "Successful", value: stats.successful, icon: CheckCircle, color: "var(--bank-success)" },
                { label: "Failed", value: stats.failed, icon: XCircle, color: "var(--bank-error)" },
                { label: "Total Amount", value: `₹${stats.totalAmount.toLocaleString()}`, icon: DollarSign, color: "var(--bank-primary)" },
                { label: "On-Chain", value: stats.onChain, icon: Lock, color: "var(--bank-cyber-green)" },
              ].map(({ label, value, icon: Icon, color }) => (
                <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bank-stat-card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--bank-text-muted)] truncate">{label}</p>
                    <p className="font-bold text-[var(--bank-text)] truncate">{value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── Tabs ── */}
            <div className="bank-card-elevated mb-6">
              <div className="flex items-center border-b border-[var(--bank-border)] px-4">
                {[
                  { key: "all", label: "All Transactions", count: allTxns.length },
                  { key: "sent", label: "Sent", count: normalizedSent.length, icon: ArrowUpRight },
                  { key: "received", label: "Received", count: normalizedReceived.length, icon: ArrowDownLeft },
                ].map(({ key, label, count, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`bank-tab ${activeTab === key ? "bank-tab-active" : ""} flex items-center gap-1.5 py-3`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {label}
                    <span className="text-xs bg-[var(--bank-bg)] border border-[var(--bank-border)] rounded-full px-2 py-0.5 ml-1">{count}</span>
                  </button>
                ))}
              </div>

              {/* Filters */}
              <div className="p-4">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--bank-text-subtle)]" />
                    <input
                      type="text"
                      placeholder="Search recipient, account, purpose, TX hash…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bank-input pl-10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bank-input w-auto min-w-[130px]">
                      <option value="all">All Status</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                      <option value="blockchain">On-Chain</option>
                      <option value="verified">Validated</option>
                    </select>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bank-input w-auto min-w-[140px]">
                      <option value="date">Sort by date</option>
                      <option value="amount">Sort by amount</option>
                      <option value="recipient">Sort by recipient</option>
                      <option value="status">Sort by status</option>
                    </select>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bank-input w-auto" title="From date" />
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bank-input w-auto" title="To date" />
                  </div>
                </div>
                <p className="text-sm text-[var(--bank-text-muted)] mt-3">
                  Showing {paginatedTxns.length} of {filteredTxns.length} transactions
                  {(dateFrom || dateTo) && <span className="ml-2 text-[var(--bank-cyber-blue)]">• Date filtered</span>}
                </p>
              </div>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="lg:hidden space-y-3 mb-6">
              {paginatedTxns.map((txn) => {
                const risk = getRiskLevel(txn);
                const isSent = txn.direction === "sent";
                return (
                  <motion.div
                    key={txn._id + (txn.direction || "")}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bank-card-elevated p-4 cursor-pointer hover:border-[var(--bank-primary)]/30 transition-colors"
                    onClick={() => setSelectedTxn(txn)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSent ? "bg-red-50" : "bg-green-50"}`}>
                          {isSent ? <ArrowUpRight className="w-5 h-5 text-[var(--bank-error)]" /> : <ArrowDownLeft className="w-5 h-5 text-[var(--bank-success)]" />}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--bank-text)]">{isSent ? txn.recipient : txn.senderName}</p>
                          <p className="text-xs text-[var(--bank-text-muted)] flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(txn.date)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge txn={txn} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RiskBadge txn={txn} />
                        <ChainBadge txn={txn} />
                      </div>
                      <p className={`font-bold ${isSent ? "text-[var(--bank-error)]" : "text-[var(--bank-success)]"}`}>
                        {isSent ? "−" : "+"}₹{txn.amount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-[var(--bank-border)] flex items-center justify-between text-xs text-[var(--bank-text-muted)]">
                      <span className="font-mono">{txn.accountNumber}</span>
                      <span className="flex items-center gap-1"><Fingerprint className="w-3 h-3" />{getFingerprint(txn)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* ── Desktop Table ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden lg:block bank-card-elevated overflow-hidden mb-6"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-[var(--bank-border)] bg-[var(--bank-bg)]">
                      {["", "Date", "Party", "Account", "Purpose", "Amount", "Status", "Security", "Chain", ""].map((h, i) => (
                        <th key={i} className={`px-4 py-3 text-xs font-semibold text-[var(--bank-text-muted)] uppercase tracking-wider ${h === "Amount" ? "text-right" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--bank-border)]">
                    {paginatedTxns.map((txn) => {
                      const isSent = txn.direction === "sent";
                      return (
                        <tr
                          key={txn._id + (txn.direction || "")}
                          className="bank-table-row bank-table-row-clickable"
                          onClick={() => setSelectedTxn(txn)}
                        >
                          <td className="px-4 py-3.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSent ? "bg-red-50" : "bg-green-50"}`}>
                              {isSent ? <ArrowUpRight className="w-4 h-4 text-[var(--bank-error)]" /> : <ArrowDownLeft className="w-4 h-4 text-[var(--bank-success)]" />}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-[var(--bank-text)] whitespace-nowrap">{formatDate(txn.date)}</td>
                          <td className="px-4 py-3.5">
                            <div>
                              <span className="font-medium text-[var(--bank-text)]">{isSent ? txn.recipient : txn.senderName}</span>
                              <span className="block text-xs text-[var(--bank-text-muted)]">{isSent ? "Recipient" : "Sender"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-sm text-[var(--bank-text)]">{txn.accountNumber}</td>
                          <td className="px-4 py-3.5 text-sm text-[var(--bank-text)] max-w-[150px] truncate">{txn.purpose}</td>
                          <td className={`px-4 py-3.5 text-right font-semibold whitespace-nowrap ${isSent ? "text-[var(--bank-error)]" : "text-[var(--bank-success)]"}`}>
                            {isSent ? "−" : "+"}₹{txn.amount?.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5"><StatusBadge txn={txn} /></td>
                          <td className="px-4 py-3.5"><RiskBadge txn={txn} /></td>
                          <td className="px-4 py-3.5"><ChainBadge txn={txn} /></td>
                          <td className="px-4 py-3.5">
                            <button className="p-1.5 rounded-lg hover:bg-[var(--bank-bg)] transition-colors" title="View details">
                              <Eye className="w-4 h-4 text-[var(--bank-text-subtle)]" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bank-card-elevated p-4">
                <p className="text-sm text-[var(--bank-text-muted)]">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-[var(--bank-border)] hover:bg-[var(--bank-bg)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) { page = i + 1; }
                    else if (currentPage <= 3) { page = i + 1; }
                    else if (currentPage >= totalPages - 2) { page = totalPages - 4 + i; }
                    else { page = currentPage - 2 + i; }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                            ? "bg-[var(--bank-primary)] text-white"
                            : "border border-[var(--bank-border)] hover:bg-[var(--bank-bg)] text-[var(--bank-text)]"
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-[var(--bank-border)] hover:bg-[var(--bank-bg)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Detail Modal ── */}
        <AnimatePresence>
          {selectedTxn && <TransactionDetailModal txn={selectedTxn} onClose={() => setSelectedTxn(null)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
