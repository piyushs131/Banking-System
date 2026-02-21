import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import ServicePage from "./pages/ServicePage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";
import LoginActivityPage from "./pages/LoginActivityPage";
import {
  LoadingSpinner,
  ProtectedRoute,
  RedirectAuthenticatedUser,
  Navbar,
} from "./components";
import {
  SignUpPage,
  LoginPage,
  EmailVerificationPage,
  TwoFactorAuthPage,
  DashboardPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  TransactionPage,
  ProfilePage,
  TransactionVerificationPage,
} from "./pages";

function App() {
  const { isCheckingAuth, checkAuth, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const isAuthRoute = ["/login", "/signup", "/forget-password", "/verify-email", "/verify-2fa"].some(
    (p) => location.pathname.startsWith(p) || location.pathname.startsWith("/reset-password")
  );

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  const pageClass = isAuthRoute || !isAuthenticated
    ? "bank-page-auth min-h-screen w-full"
    : "bank-page-app min-h-screen w-full";

  return (
    <main className={pageClass}>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectAuthenticatedUser>
              <SignUpPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <LoginPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/verify-email"
          element={
            <RedirectAuthenticatedUser>
              <EmailVerificationPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/verify-2fa"
          element={
            <RedirectAuthenticatedUser>
              <TwoFactorAuthPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/forget-password"
          element={
            <RedirectAuthenticatedUser>
              <ForgotPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/service"
          element={
            <ProtectedRoute>
              <ServicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaction-history"
          element={
            <ProtectedRoute>
              <TransactionHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaction-verification"
          element={
            <ProtectedRoute>
              <TransactionVerificationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login-activity"
          element={
            <ProtectedRoute>
              <LoginActivityPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "var(--bank-bg-elevated)", color: "var(--bank-text)", border: "1px solid var(--bank-border)" },
        }}
      />
    </main>
  );
}

export default App;
