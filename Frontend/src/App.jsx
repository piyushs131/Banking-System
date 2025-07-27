import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import ServicePage from "./pages/ServicePage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";
import {
  FloatingShape,
  LoadingSpinner,
  MouseTracker,
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
  const { isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden
      bg-gradient-to-br from-blue-800 to-violet-900 text-white"
    >
      <Navbar />
      <FloatingShape
        color={"bg-blue-500"}
        size={"w-64 h-64"}
        top={"-5%"}
        left={"10%"}
        delay={0}
      />
      <FloatingShape
        color={"bg-purple-500"}
        size={"w-48 h-48"}
        top={"70%"}
        left={"80%"}
        delay={5}
      />
      <FloatingShape
        color={"bg-violet-500"}
        size={"w-32 h-32"}
        top={"40%"}
        left={"-10%"}
        delay={2}
      />

      <MouseTracker />

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
        <Route
          path="/reset-password/:token"
          element={
              <ResetPasswordPage />
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
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
      </Routes>

      <Toaster />
    </main>
  );
}

export default App;
