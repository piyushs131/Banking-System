import { Check, X } from "lucide-react";

const criteria = [
  { label: "At least 6 characters", test: (p) => p.length >= 6 },
  { label: "At least 1 uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "At least 1 lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "At least 1 number", test: (p) => /\d/.test(p) },
  { label: "At least 1 special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const PasswordStrengthMeter = ({ password }) => {
  const strength = [
    password.length > 6,
    /[A-Z]/.test(password) && /[a-z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password),
  ].filter(Boolean).length;

  const strengthLabel = ["Very weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor =
    strength <= 1 ? "var(--bank-error)" : strength <= 2 ? "var(--bank-warning)" : "var(--bank-success)";

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[var(--bank-text-muted)]">Password strength</span>
        <span className="text-xs font-medium" style={{ color: strengthColor }}>
          {strengthLabel}
        </span>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{
              background: i < strength ? strengthColor : "var(--bank-border)",
            }}
          />
        ))}
      </div>
      <div className="mt-2 space-y-1">
        {criteria.map(({ label, test }) => {
          const met = test(password);
          return (
            <div key={label} className="flex items-center gap-2 text-xs">
              {met ? (
                <Check className="w-4 h-4 text-[var(--bank-success)]" />
              ) : (
                <X className="w-4 h-4 text-[var(--bank-text-subtle)]" />
              )}
              <span className={met ? "text-[var(--bank-success)]" : "text-[var(--bank-text-muted)]"}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
