import dotenv from "dotenv";
dotenv.config();

const TEST_SECRET = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";

export const verifyCaptcha = async (token) => {
  if (!token) return false;
  
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  // Test key: accept any non-empty token (Google test keys bypass verification)
  if (secret === TEST_SECRET && token.length > 10) return true;

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secret}&response=${token}`,
      }
    );
    const data = await response.json();
    return !!data.success;
  } catch (err) {
    console.error("Captcha verification failed:", err.message);
    return false;
  }
};
