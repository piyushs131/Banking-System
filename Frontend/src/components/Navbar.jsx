import React from "react";
import { motion } from "framer-motion";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Navbar = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => {
    try {
      logout();
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <header className="w-full py-2 px-8 flex items-center justify-between backdrop-blur-md shadow-md fixed top-0 left-0 z-50 border-b border-gray-200">
      {/* Left side - Bank Branding */}
      <button onClick={() => navigate("/")} className="flex items-center space-x-3">
        <div className="bg-blue-600 text-white rounded-lg px-4 py-2 font-bold text-lg tracking-wide shadow-lg cursor-pointer">
          CANARA BANK
        </div>
        {/* <div className="hidden md:block">
          <span className="text-gray-700 font-medium text-sm">Fraud Detection Portal</span>
        </div> */}
      </button>

      {/* Right side - Logout Button */}
      <nav className="flex items-center">
        <div className=" flex flex-col sm:flex-row sm:justify-center gap-3 items-center">
          <Link
            to="/transactions"
            className="inline-flex items-center bg-blue-700 text-white-700 font-semibold px-6 py-3 rounded-full hover:bg-blue-100 transition"
          >
            Make a Transaction <ArrowRight className="ml-2" />
          </Link>
          <Link
            to="/service"
            className="px-4 py-2  rounded-xl font-medium shadow bg-blue-700 hover:bg-blue-200 transition-all border border-blue-200"
          >
            Service
          </Link>
          <Link
            to="/transaction-history"
            className="px-4 py-2  bg-blue-700 rounded-xl font-medium shadow hover:bg-purple-200 transition-all border border-purple-200"
          >
            Transaction History
          </Link>
        </div>
        <motion.button
          whileHover={{
            scale: 1.08,
            boxShadow: "0 4px 24px rgba(59,130,246,0.15)",
          }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 mx-2 w-fit bg-blue-700 rounded-xl flex items-center gap-2 font-medium shadow hover:bg-purple-200 transition-all border border-purple-200 cursor-pointer"
          title="Dashboard"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="hidden sm:inline">Dashboard</span>
        </motion.button>
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 4px 24px rgba(239,68,68,0.15)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2 px-5 py-2 bg-blue-700 border border-red-200 rounded-full shadow-md font-semibold transition-all duration-200 hover:bg-red-50 hover:text-red-700 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </nav>
    </header>
  );
};

export default Navbar;
