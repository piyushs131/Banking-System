import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  DollarSign,
  Shield,
  TrendingUp,
  Users,
  Building,
  Smartphone,
  Globe,
  Lock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "../components";

const ServicePage = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    occupation: "",
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(
          "http://localhost:5000/api/service-requests",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, service: selectedService }),
          }
        );
        const data = await response.json();
        if (data.success) {
          alert("Service request submitted successfully!");
          // Reset form data
          setFormData({
            fullName: "",
            email: "",
            phone: "",
            dateOfBirth: "",
            address: "",
            occupation: "",
          });
          // Hide the form
          setSelectedService(null);
        } else {
          alert(data.error || "Submission failed");
        }
      } catch (err) {
        alert("Server error");
      }
    },
    [formData, selectedService]
  );

  const services = [
    {
      icon: CreditCard,
      label: "Payments",
      description:
        "Secure payment processing with fraud detection and real-time monitoring for all your financial transactions.",
    },
    {
      icon: DollarSign,
      label: "Finance",
      description:
        "Comprehensive financial services including loans, investments, and wealth management with AI-powered insights.",
    },
    {
      icon: Shield,
      label: "Security",
      description:
        "Advanced security solutions with biometric authentication, encryption, and 24/7 fraud monitoring.",
    },
    {
      icon: TrendingUp,
      label: "Growth",
      description:
        "Business growth strategies, market analysis, and expansion planning with data-driven recommendations.",
    },
    {
      icon: Users,
      label: "Customers",
      description:
        "Customer relationship management, support systems, and personalized banking experiences.",
    },
    {
      icon: Building,
      label: "Enterprise",
      description:
        "Enterprise-grade banking solutions for large corporations with custom integration and dedicated support.",
    },
    {
      icon: Smartphone,
      label: "Mobile",
      description:
        "Mobile banking apps with advanced features, push notifications, and seamless cross-platform experience.",
    },
    {
      icon: Globe,
      label: "Global",
      description:
        "International banking services, currency exchange, and global payment solutions for worldwide transactions.",
    },
    {
      icon: Lock,
      label: "Privacy",
      description:
        "Privacy protection services, data encryption, and compliance with international security standards.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="pt-32 pb-10 w-full flex flex-col items-center">
        <h1 className="text-blue-900 text-4xl font-extrabold mb-8 drop-shadow-lg tracking-tight">
          Choose a Service
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-14 w-full max-w-5xl px-4">
          {services.map(({ icon: Icon, label, description }) => (
            <motion.div
              key={label}
              onClick={() => setSelectedService(label)}
              className={`cursor-pointer backdrop-blur-xl bg-white/40 border border-blue-200 shadow-lg text-blue-900 rounded-2xl p-8 flex flex-col justify-between hover:bg-blue-100/80 hover:shadow-2xl transition duration-300 min-h-[200px] ${
                selectedService === label ? "ring-4 ring-blue-400" : ""
              }`}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-blue-600 text-white rounded-full p-3 shadow-lg">
                  <Icon className="w-7 h-7" />
                </span>
                <span className="text-xl font-semibold tracking-wide">
                  {label}
                </span>
              </div>
              <p className="text-sm text-blue-600 mb-4 leading-relaxed">
                {description}
              </p>
              <div className="flex justify-end">
                <ArrowRight className="w-5 h-5 text-blue-500" />
              </div>
            </motion.div>
          ))}
        </div>
        <AnimatePresence>
          {selectedService && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="backdrop-blur-2xl bg-white/70 border border-blue-200 shadow-2xl text-blue-900 rounded-3xl p-10 w-full max-w-2xl mx-auto mt-2 relative z-30"
            >
              <h2 className="text-2xl font-bold mb-6 text-blue-800 tracking-tight">
                Get in Touch for{" "}
                <span className="text-blue-600">{selectedService}</span>
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-2 text-base font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-white/60 text-blue-900 placeholder-blue-400 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium shadow"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-base font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/60 text-blue-900 placeholder-blue-400 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium shadow"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-base font-medium">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-white/60 text-blue-900 placeholder-blue-400 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium shadow"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-base font-medium">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full bg-white/60 text-blue-900 placeholder-blue-400 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium shadow"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-base font-medium">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-white/60 text-blue-900 placeholder-blue-400 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium shadow"
                    placeholder="Enter your address"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-base font-medium">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full bg-white/60 text-blue-900 placeholder-blue-400 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium shadow"
                    placeholder="Enter your occupation"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-base font-medium">
                    Service
                  </label>
                  <input
                    type="text"
                    name="service"
                    value={selectedService || ""}
                    readOnly
                    className="w-full bg-blue-100 text-blue-700 font-semibold px-5 py-3 rounded-xl focus:outline-none cursor-not-allowed shadow"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-300 text-lg tracking-wide"
                >
                  Submit
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Decorative SVG or background shapes for bank feel */}
      {/* <svg
        className="absolute bottom-0 left-0 w-full h-40 z-0"
        viewBox="0 0 1440 320"
      >
        <path
          fill="#2563eb"
          fillOpacity="0.2"
          d="M0,224L48,197.3C96,171,192,117,288,117.3C384,117,480,171,576,197.3C672,224,768,224,864,197.3C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg> */}
    </div>
  );
};

export default ServicePage;
