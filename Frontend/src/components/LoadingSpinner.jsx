import { motion } from "framer-motion";

const LoadingSpinner = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bank-bg)" }}
    >
      <div className="text-center">
        <motion.div
          className="w-14 h-14 rounded-full border-4 border-[var(--bank-border)] border-t-[var(--bank-primary)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
        <p className="mt-4 text-sm font-medium text-[var(--bank-text-muted)]">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
