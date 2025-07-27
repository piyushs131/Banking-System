import { useState, useEffect } from "react";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  DollarSign,
  Send,
  ShieldCheck,
  User,
  CreditCard,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import useContextData from "../hooks/useContextData";
import { useNavigate, Link } from "react-router-dom";

const TransactionPage = () => {
  const [formData, setFormData] = useState({
    amount: "",
    recipientAccountNumber: "",
    purpose: "",
    note: "",
  });

  const [useBlockchain, setUseBlockchain] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [chainStatus, setChainStatus] = useState("");
  const [animationStep, setAnimationStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [isLoadingRecipient, setIsLoadingRecipient] = useState(false);
  const [myAccountInfo, setMyAccountInfo] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(null);
  const [showBalance, setShowBalance] = useState(false);

  const { context, handleKeyDown } = useContextData();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch current user's account details and balance
  useEffect(() => {
    const fetchMyAccountDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const [accountResponse, balanceResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/my-account", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/transactions/balance", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (accountResponse.data.success) {
          setMyAccountInfo(accountResponse.data.accountDetails);
        }

        if (balanceResponse.data.success) {
          setCurrentBalance(balanceResponse.data.balance);
        }
      } catch (error) {
        console.error("Error fetching account details:", error);
      }
    };

    fetchMyAccountDetails();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    // If recipient account number is entered, fetch recipient details
    if (
      e.target.name === "recipientAccountNumber" &&
      e.target.value.length === 12
    ) {
      fetchRecipientDetails(e.target.value);
    } else if (
      e.target.name === "recipientAccountNumber" &&
      e.target.value.length !== 12
    ) {
      setRecipientInfo(null);
    }
  };

  const fetchRecipientDetails = async (accountNumber) => {
    if (accountNumber.length !== 12) return;

    setIsLoadingRecipient(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/auth/user/${accountNumber}`
      );
      if (response.data.success) {
        setRecipientInfo(response.data.user);
      } else {
        setRecipientInfo(null);
      }
    } catch (error) {
      console.error("Error fetching recipient details:", error);
      setRecipientInfo(null);
    } finally {
      setIsLoadingRecipient(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    // Check if user has sufficient balance
    if (currentBalance !== null && Number(formData.amount) > currentBalance) {
      setError("Insufficient balance for this transaction");
      toast.error("Insufficient balance for this transaction");
      return;
    }

    setIsSubmitting(true);
    setStatus("");
    setError("");
    setTxHash("");
    setChainStatus("");

    try {
      const token = localStorage.getItem("token");
      const endpoint = useBlockchain
        ? "http://localhost:5000/api/transactions/create"
        : "http://localhost:5000/api/transactions";

      // Include context data in the request
      const requestData = {
        ...formData,
        context: context, // Add context data for security evaluation
        useBlockchain: useBlockchain, // Include blockchain preference
      };

      const res = await axios.post(endpoint, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check for risk-based responses
      if (res.data.success === false) {
        if (
          res.data.message &&
          res.data.message.includes("Suspicious activity")
        ) {
          setError(res.data.message);
          toast.error(
            "Transaction blocked due to suspicious activity. Check your email for details."
          );
          return;
        } else if (res.data.requireVerification) {
          setError(
            "Additional verification required due to unusual activity. Please check your email for the verification code."
          );
          toast.success(
            "Verification code sent to your email. Please check and enter the code."
          );
          navigate("/transaction-verification");
          return;
        }
      }

      setStatus("Transaction Successful");
      navigate("/transaction-history");
      setFormData({
        amount: "",
        recipientAccountNumber: "",
        purpose: "",
        note: "",
      });

      if (res?.data?.txHash) {
        setTxHash(res.data.txHash);
        setChainStatus(res.data.chainStatus || "Confirmed");
      }
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Transaction Failed. Please try again.";
      setError(errorMessage);

      // Show appropriate toast messages for different error types
      if (err?.response?.status === 403) {
        toast.error(
          "Transaction blocked for security reasons. Check your email for details."
        );
      } else if (
        err?.response?.status === 200 &&
        err?.response?.data?.requireVerification
      ) {
        toast.success(
          "Verification code sent to your email. Please check and enter the code."
        );
        navigate("/transaction-verification");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen w-full pt-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>


      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Transfer Money Securely
          </h2>
          <p className="text-gray-600 text-lg">
            Complete your transaction with advanced security features and
            blockchain verification
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            {/* Account Balance Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Account Balance
                </h3>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {showBalance ? (
                    <EyeOff className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {showBalance ? (
                    <span className="text-green-600">
                      ₹{currentBalance?.toLocaleString() || "0"}
                    </span>
                  ) : (
                    <span className="text-gray-400">••••••</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Available for transactions
                </p>
              </div>
            </div>

            {/* Account Details Card */}
            {myAccountInfo && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  My Account Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Name</span>
                    <span className="font-medium text-gray-800">
                      {myAccountInfo.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">
                      Account Number
                    </span>
                    <span className="font-mono font-medium text-gray-800 text-sm">
                      {myAccountInfo.accountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">IFSC Code</span>
                    <span className="font-mono font-medium text-gray-800 text-sm">
                      {myAccountInfo.ifscCode}
                    </span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-700 text-center">
                    Share these details with others to receive money
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Center Column - Transaction Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <Send className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Transaction Details
                </h2>
                <p className="text-gray-600">
                  Fill in the details below to complete your transfer
                </p>
              </div>

              {/* Blockchain Security Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 mb-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <label
                      htmlFor="useBlockchain"
                      className="text-sm font-semibold text-gray-800 cursor-pointer"
                    >
                      Secure via Blockchain
                    </label>
                    <p className="text-xs text-gray-600">
                      Enhanced security with blockchain verification
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="useBlockchain"
                    checked={useBlockchain}
                    onChange={() => setUseBlockchain(!useBlockchain)}
                    className="sr-only"
                  />
                  <label
                    htmlFor="useBlockchain"
                    className={`relative inline-flex w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 shadow-inner ${
                      useBlockchain
                        ? "bg-gradient-to-r from-blue-600 to-purple-600"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transform transition-transform duration-200 shadow-md ${
                        useBlockchain ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </label>
                </div>
              </motion.div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
                onKeyDown={handleKeyDown}
              >
                {/* Recipient Account Number */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Recipient Account Number
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="recipientAccountNumber"
                      value={formData.recipientAccountNumber}
                      onChange={handleChange}
                      required
                      placeholder="Enter 12-digit account number"
                      className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white focus:bg-white transition-all duration-200 text-lg text-gray-600 placeholder-gray-500"
                      maxLength={12}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Enter the 12-digit account number of the recipient
                  </p>

                  {/* Recipient Info Display */}
                  <AnimatePresence>
                    {isLoadingRecipient && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-blue-700 font-medium">
                            Loading recipient details...
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {recipientInfo && !isLoadingRecipient && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-semibold text-green-800">
                            Recipient Verified
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-700 font-medium">
                              Name:
                            </span>
                            <span className="font-semibold text-green-900">
                              {recipientInfo.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700 font-medium">
                              Account:
                            </span>
                            <span className="font-mono font-semibold text-green-900">
                              {recipientInfo.accountNumber}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700 font-medium">
                              IFSC:
                            </span>
                            <span className="font-mono font-semibold text-green-900">
                              {recipientInfo.ifscCode}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Amount */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Amount (₹)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      placeholder="Enter amount"
                      className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white focus:bg-white transition-all duration-200 text-lg text-gray-600 placeholder-gray-500 pl-12"
                      min="1"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <span className="text-gray-500 font-medium">₹</span>
                    </div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {currentBalance !== null &&
                    Number(formData.amount) > currentBalance && (
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Insufficient balance. Available: ₹
                        {currentBalance.toLocaleString()}
                      </p>
                    )}
                </motion.div>

                {/* Purpose */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Purpose
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="e.g., Bill Payment, Rent, Gift, Business"
                    className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white focus:bg-white transition-all duration-200 resize-none text-lg text-gray-600 placeholder-gray-500"
                  />
                </motion.div>

                {/* Note */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Note (Optional)
                  </label>
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Add a personal note for the recipient"
                    className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white focus:bg-white transition-all duration-200 text-lg text-gray-600 placeholder-gray-500"
                  />
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-5 rounded-xl text-lg font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Processing Transaction...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      <span>Send Money Securely</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Status Messages */}
              <AnimatePresence>
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl"
                  >
                    <div className="flex items-center gap-3 text-green-700">
                      <CheckCircle className="w-6 h-6" />
                      <div>
                        <p className="font-semibold">{status}</p>
                        {useBlockchain && txHash && (
                          <div className="mt-2 text-sm">
                            <p>
                              <strong>Transaction Hash:</strong>{" "}
                              <span className="font-mono text-xs break-all">
                                {txHash}
                              </span>
                            </p>
                            <p>
                              <strong>Status:</strong>{" "}
                              <span className="text-green-600">
                                {chainStatus}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <div className="flex items-center gap-3 text-red-700">
                      <XCircle className="w-6 h-6" />
                      <span className="font-medium">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
