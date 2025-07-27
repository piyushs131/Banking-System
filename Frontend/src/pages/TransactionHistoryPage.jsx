import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { 
  LogOut, 
  Loader, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  CreditCard, 
  Building, 
  Target, 
  DollarSign,
  ArrowLeft,
  TrendingUp,
  Filter,
  Search,
  Download,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "../utils/date";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/transactions" : "/api/transactions";

export default function TransactionHistoryPage() {
  const { logout } = useAuthStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.get(API_URL);
        setTransactions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError("Failed to fetch transactions");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const handleLogout = () => {
    try {
      logout();
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(txn => {
      const matchesSearch = 
        txn.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.accountNumber?.includes(searchTerm) ||
        txn.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "success" && txn.status.includes("Success")) ||
        (statusFilter === "failed" && !txn.status.includes("Success"));
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date) - new Date(a.date);
        case "amount":
          return b.amount - a.amount;
        case "recipient":
          return a.recipient?.localeCompare(b.recipient);
        default:
          return 0;
      }
    });

  const LoadingSkeleton = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 animate-pulse">
          <div className="h-12 w-12 rounded-full bg-gray-300" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 bg-gray-300 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
          </div>
          <div className="h-6 w-24 bg-gray-300 rounded" />
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="text-center py-16"
    >
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
        <CheckCircle className="w-12 h-12 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">No transactions yet</h3>
      <p className="text-gray-600 max-w-sm mx-auto mb-6">
        Your transaction history will appear here once you start making transfers.
      </p>
      <Link
        to="/transactions"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
      >
        <DollarSign className="w-4 h-4" />
        Make Your First Transaction
      </Link>
    </motion.div>
  );

  const ErrorState = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="text-center py-16"
    >
      <div className="mx-auto w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
        <XCircle className="w-12 h-12 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to load transactions</h3>
      <p className="text-gray-600 mb-6">{error}</p>
      <button 
        onClick={handleRefresh} 
        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-lg"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </motion.div>
  );

  const TransactionCard = ({ txn }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="md:hidden"
    >
      <div className="mb-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 border border-white/20">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{txn.recipient}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(txn.date)}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              txn.status.includes("Success (No Blockchain)") 
                ? "bg-yellow-100 text-yellow-800 border border-yellow-200" 
                : txn.status.includes("Success") 
                  ? "bg-green-100 text-green-800 border border-green-200" 
                  : "bg-red-100 text-red-800 border border-red-200"
            }`}>
              {txn.status.includes("Success") ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />} 
              {txn.status.includes("Success") ? "Success" : "Failed"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">Account: {txn.accountNumber}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-purple-600" />
              <span className="text-gray-700">IFSC: {txn.ifsc}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">{txn.purpose}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-700">₹{txn.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen w-full pt-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-8 px-6">
        {loading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin w-6 h-6 text-blue-600 mr-3" />
              <span className="text-blue-600 font-medium">Loading transactions...</span>
            </div>
            <LoadingSkeleton />
          </div>
        ) : error ? (
          <ErrorState />
        ) : transactions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 flex items-center"
              >
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-800">{transactions.length}</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 flex items-center"
              >
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-gray-800">{transactions.filter((t) => t.status.includes("Success")).length}</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 flex items-center"
              >
                <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-800">₹{transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</p>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 flex items-center"
              >
                <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Amount</p>
                  <p className="text-2xl font-bold text-gray-800">₹{Math.round(transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length).toLocaleString()}</p>
                </div>
              </motion.div>
            </div>

            {/* Filters and Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
            >
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 text-gray-600 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border-2 text-gray-600 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="success">Successful</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border-2 text-gray-600 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                    <option value="recipient">Sort by Recipient</option>
                  </select>
                  <button
                    onClick={handleRefresh}
                    className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredTransactions.map((txn) => (
                <TransactionCard key={txn._id} txn={txn} />
              ))}
            </div>

            {/* Desktop Table */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="hidden md:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20"
            >
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-lg text-gray-800">Recent Transactions</span>
                  <span className="text-sm text-gray-600">({filteredTransactions.length} transactions)</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Recipient</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Account Number</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">IFSC Code</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Purpose</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((txn) => (
                      <tr key={txn._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(txn.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium">{txn.recipient}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-700">{txn.accountNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-700">{txn.ifsc}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{txn.purpose}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-green-700">₹{txn.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            txn.status.includes("Success (No Blockchain)") 
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200" 
                              : txn.status.includes("Success") 
                                ? "bg-green-100 text-green-800 border border-green-200" 
                                : "bg-red-100 text-red-800 border border-red-200"
                          }`}>
                            {txn.status.includes("Success") ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />} 
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
