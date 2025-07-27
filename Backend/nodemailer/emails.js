import { sendEmail } from "./nodemailer.config.js";
import {getLocationName} from "../utils/getLocationName.js"
import {
  ACCOUNT_DELETION_CONFIRMATION_TEMPLATE,
  NEWDEVICE_LOGIN_ALERT_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  SUSPICIOUS_ACTIVITY_WARNING_TEMPLATE,
  TWO_FACTOR_AUTH_TEMPLATE,
  SUSPICIOUS_TRANSACTION_ALERT_TEMPLATE,
  TRANSACTION_VERIFICATION_TEMPLATE,
} from "./emailTemplates.js";

export const sendVerificationEmail = async (email, verificationCode) => {
  // const recipent = [{ email }];
  try {
    const response = await sendEmail(
      email,
      "Verify Your Email",
      VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationCode
      )
    );

    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendWelcomeEmail = async (email, name) => {
  // const recipent = [{ email }];

  try {
    const response = await sendEmail(
      email,
      "Welcome to Auth V1",
      WELCOME_EMAIL_TEMPLATE.replace("{name}", name)
    );

    console.log("Welcome email sent successfully:", response);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};

export const sendResetPasswordEmail = async (email, resetURL) => {
  // const recipent = [{ email }];

  try {
    const response = await sendEmail(
      email,
      "Reset Your Password",
      PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL)
    );

    console.log("Password reset email sent successfully:", response);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

export const sendResetSuccessEmail = async (email) => {
  // const recipent = [{ email }];

  try {
    const response = await sendEmail(
      email,
      "Password Reset Successful",
      PASSWORD_RESET_SUCCESS_TEMPLATE
    );

    console.log("Password reset success email sent successfully:", response);
  } catch (error) {
    console.error("Error sending password reset success email:", error);
    throw new Error("Failed to send password reset success email");
  }
};

export const sendAccountDeletionEmail = async (email, name) => {
  // const recipent = [{ email }];

  try {
    const response = await sendEmail(
      email,
      "Account Deletion Confirmation",
      ACCOUNT_DELETION_CONFIRMATION_TEMPLATE.replace("{name}", name)
    );

    console.log("Account deletion email sent successfully:", response);
  } catch (error) {
    console.error("Error sending account deletion email:", error);
    throw new Error("Failed to send account deletion email");
  }
};

export const sendNewDeviceLoginAlert = async (
  email,
  name,
  deviceInfo,
  resetURL
) => {
  // const recipent = [{ email }];

  try {
    const response = await sendEmail(
      email,
      "New Device Login Alert",
      NEWDEVICE_LOGIN_ALERT_TEMPLATE.replace("{name}", name)
        .replace("{device}", deviceInfo.device)
        .replace("{browser}", deviceInfo.browser)
        .replace("{location}", "Delhi, India")
        .replace("{ip}", deviceInfo.ip)
        .replace("{time}", new Date().toLocaleString())
        .replace("{secureLink}", resetURL)
    );

    console.log("New device login alert email sent successfully:", response);
  } catch (error) {
    console.error("Error sending new device login alert email:", error);
    throw new Error("Failed to send new device login alert email");
  }
};

export const sendSuspiciousActivityWarning = async (
  email,
  name,
  context,
  riskScore
) => {
  try {
    const response = await sendEmail(
      email,
      "⚠️ Suspicious Activity Detected - Login Blocked",
      SUSPICIOUS_ACTIVITY_WARNING_TEMPLATE.replace("{name}", name)
        .replace("{device}", context.device)
        .replace("{browser}", context.browser)
        .replace("{location}", await getLocationName(context.location.latitude, context.location.longitude))
        .replace("{ip}", context.ip)
        .replace("{time}", new Date().toLocaleString())
        .replace("{riskScore}", riskScore.toString())
    );

    console.log(
      "Suspicious activity warning email sent successfully:",
      response
    );
  } catch (error) {
    console.error("Error sending suspicious activity warning email:", error);
    throw new Error("Failed to send suspicious activity warning email");
  }
};

export const sendTwoFactorAuthEmail = async (
  email,
  name,
  verificationCode,
  context
) => {
  try {
    const response = await sendEmail(
      email,
      "🔐 Two-Factor Authentication Required",
      TWO_FACTOR_AUTH_TEMPLATE.replace("{name}", name)
        .replace("{verificationCode}", verificationCode)
        .replace("{device}", context.device)
        .replace(
          "{location}",
          await getLocationName(context.location.latitude, context.location.longitude)
        )
        .replace("{time}", new Date().toLocaleString())
    );

    console.log("Two-factor authentication email sent successfully:", response);
  } catch (error) {
    console.error("Error sending two-factor authentication email:", error);
    throw new Error("Failed to send two-factor authentication email");
  }
};

export const sendSuspiciousTransactionAlert = async (
  email,
  name,
  context,
  riskScore,
  transactionDetails
) => {
  try {
    const response = await sendEmail(
      email,
      "⚠️ Suspicious Transaction Activity Detected",
      SUSPICIOUS_TRANSACTION_ALERT_TEMPLATE.replace("{name}", name)
        .replace("{amount}", transactionDetails.amount)
        .replace("{recipient}", transactionDetails.recipient)
        .replace("{accountNumber}", transactionDetails.accountNumber)
        .replace("{purpose}", transactionDetails.purpose)
        .replace("{device}", context.device)
        .replace("{browser}", context.browser)
        .replace(
          "{location}",
          await getLocationName(context.location.latitude, context.location.longitude)
        )
        .replace("{ip}", context.ip)
        .replace("{time}", new Date().toLocaleString())
        .replace("{riskScore}", riskScore.toString())
    );

    console.log("Suspicious transaction alert email sent successfully:", response);
  } catch (error) {
    console.error("Error sending suspicious transaction alert email:", error);
    throw new Error("Failed to send suspicious transaction alert email");
  }
};

export const sendTransactionVerificationEmail = async (
  email,
  name,
  verificationCode,
  context,
  transactionDetails
) => {
  try {
    const response = await sendEmail(
      email,
      "🔐 Transaction Verification Required",
      TRANSACTION_VERIFICATION_TEMPLATE.replace("{name}", name)
        .replace("{verificationCode}", verificationCode)
        .replace("{amount}", transactionDetails.amount)
        .replace("{recipient}", transactionDetails.recipient)
        .replace("{accountNumber}", transactionDetails.accountNumber)
        .replace("{purpose}", transactionDetails.purpose)
        .replace("{device}", context.device)
        .replace(
          "{location}",
          await getLocationName(context.location.latitude, context.location.longitude)
        )
        .replace("{time}", new Date().toLocaleString())
    );

    console.log("Transaction verification email sent successfully:", response);
  } catch (error) {
    console.error("Error sending transaction verification email:", error);
    throw new Error("Failed to send transaction verification email");
  }
};
