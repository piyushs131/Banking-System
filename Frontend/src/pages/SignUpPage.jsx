import { useState } from "react";
import { motion } from "framer-motion";
import { Input, PasswordStrengthMeter } from "../components";
import { Loader, Lock, Mail, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuthStore } from "../store/authStore";
import useContextData from "../hooks/useContextData";

const SignUpPage = () => {
  const { context, handleKeyDown } = useContextData();
  const [captcha, setCaptcha] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signup, error, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleCaptcha = (value) => setCaptcha(value);

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      await signup(name, email, password, context, captcha);
      navigate("/verify-email");
    } catch (error) {
      console.error("Sign Up failed:", error);
    }
  };
  return (
    <div className="min-h-screen w-full py-20 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="max-w-md w-full bg-gray-800 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-violet-500 text-transparent bg-clip-text mb-6">
            Create Account
          </h2>
          <form onSubmit={handleSignUp}>
            <Input
              icon={User}
              type="text"
              placeholder="Full Name"
              value={name}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <PasswordStrengthMeter password={password} />
            
            <Input
              icon={Mail}
              type="email"
              placeholder="Email Address"
              value={email}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <Input
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            {error && <p className="text-red-500 text-sm pb-2">{error}</p>}
            <PasswordStrengthMeter password={password} />

            <motion.button
              className="w-full py-3 mt-5 bg-gradient-to-r from-blue-500 to-violet-500 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-violet-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="animate-spin mx-auto" size={24} />
              ) : (
                "Sign Up"
              )}
            </motion.button>
          </form>
        </div>
        <ReCAPTCHA
          className="mx-auto mb-4 w-fit"
          sitekey="6Lem2HArAAAAAGpEIecDPyOEul3BJuwdMal32AgL"
          onChange={handleCaptcha}
        />
        <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-500 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
