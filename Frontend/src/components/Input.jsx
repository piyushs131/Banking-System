import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const Input = ({ icon: Icon, type = "text", label, className = "", ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-5">
      {label && (
        <label className="block mb-1.5 text-sm font-medium text-[var(--bank-text)]">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bank-text-subtle)]">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          {...props}
          type={isPassword && showPassword ? "text" : type}
          className={`bank-input ${Icon ? "pl-10" : ""} ${isPassword ? "pr-10" : ""} ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--bank-text-subtle)] hover:text-[var(--bank-text)]"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
