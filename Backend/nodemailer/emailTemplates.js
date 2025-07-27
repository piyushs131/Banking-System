export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #2b7fff, #8e51ff); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2b7fff;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>Auth V1 Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #2b7fff, #8e51ff); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #2b7fff; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>Your App Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right,  #2b7fff, #8e51ff); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #2b7fff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 30 minutes for security reasons.</p>
    <p>Best regards,<br>Auth v1 Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Our Platform</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #2b7fff, #8e51ff); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome to Our Platform</h1>
  </div>

  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hi <strong>{name}</strong>,</p>
    <p>We're thrilled to have you on board! 🎉</p>

    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #2b7fff; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; text-align: center; font-size: 30px;">
        😎
      </div>
    </div>

    <p>Here's what you can do now:</p>
    <ul>
      <li>Explore our features and tools</li>
      <li>Complete your profile to get personalized content</li>
      <li>Stay updated with the latest tips and updates</li>
    </ul>

    <p>If you have any questions or need help, feel free to reach out to our support team at any time.</p>

    <p>We’re excited to see what you’ll achieve!</p>
    <p>Warm regards,<br>The Auth App Team</p>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const ACCOUNT_DELETION_CONFIRMATION_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Account Deletion Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #2b7fff, #8e51ff); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Account Deleted Successfully</h1>
  </div>

  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hi <strong>{name}</strong>,</p>
    <p>We’re writing to confirm that your account has been permanently deleted from our platform.</p>

    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #8e51ff; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; text-align: center; font-size: 26px;">
        🗑️
      </div>
    </div>

    <p>All your data has been securely removed and will no longer be accessible. If this was a mistake or you wish to return, you’re always welcome to create a new account with us.</p>

    <p>We’d like to thank you for your time with us. If there’s anything we could’ve done better, feel free to share your feedback.</p>

    <p>Wishing you the best ahead,<br>The Auth App Team</p>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const NEWDEVICE_LOGIN_ALERT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Device Login Detected</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #ff4b2b, #ff416c); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">New Device Login Alert</h1>
  </div>

  <div style="background-color: #fff8f8; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hi <strong>{name}</strong>,</p>
    <p>We noticed a login to your account from a new device or location:</p>

    <ul style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);">
      <li><strong>Device:</strong> {device}</li>
      <li><strong>Browser:</strong> {browser}</li>
      <li><strong>Location:</strong> {location}</li>
      <li><strong>IP Address:</strong> {ip}</li>
      <li><strong>Time:</strong> {time}</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #ff4b2b; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; text-align: center; font-size: 28px;">
        ⚠️
      </div>
    </div>

    <p>If this was <strong>you</strong>, no further action is needed.</p>
    <p>If this wasn't you, please <a href="{secureLink}" style="color: #ff4b2b;">secure your account immediately</a> and change your password.</p>

    <p>Stay safe,<br>The Auth App Security Team</p>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const SUSPICIOUS_ACTIVITY_WARNING_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Suspicious Activity Detected</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #ff6b35, #f7931e); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">⚠️ Suspicious Activity Detected</h1>
  </div>

  <div style="background-color: #fff8f8; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hi <strong>{name}</strong>,</p>
    <p>Our security system has detected suspicious activity on your account and has temporarily blocked the login attempt for your protection.</p>

    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #ff6b35; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; text-align: center; font-size: 28px;">
        🚫
      </div>
    </div>

    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); margin: 20px 0;">
      <h3 style="margin-top: 0; color: #ff6b35;">Login Attempt Details:</h3>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Device:</strong> {device}</li>
        <li><strong>Browser:</strong> {browser}</li>
        <li><strong>Location:</strong> {location}</li>
        <li><strong>IP Address:</strong> {ip}</li>
        <li><strong>Time:</strong> {time}</li>
        <li><strong>Risk Score:</strong> {riskScore}</li>
      </ul>
    </div>

    <p><strong>What this means:</strong></p>
    <ul>
      <li>Your account is safe and no unauthorized access occurred</li>
      <li>The login attempt was blocked due to unusual patterns</li>
      <li>This could be due to a new device, location, or unusual behavior</li>
    </ul>

    <p><strong>If this was you:</strong></p>
    <ul>
      <li>Try logging in from a trusted device and location</li>
      <li>Ensure you're using your usual browser and network</li>
      <li>Contact support if you continue to experience issues</li>
    </ul>

    <p><strong>If this wasn't you:</strong></p>
    <ul>
      <li>Your account is already protected</li>
      <li>Consider changing your password as a precaution</li>
      <li>Enable two-factor authentication for additional security</li>
    </ul>

    <p>Thank you for helping us keep your account secure!</p>
    <p>Best regards,<br>The Auth App Security Team</p>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>`;

export const TWO_FACTOR_AUTH_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Two-Factor Authentication Required</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #2b7fff, #8e51ff); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">🔐 Two-Factor Authentication</h1>
  </div>

  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hi <strong>{name}</strong>,</p>
    <p>For your security, we require additional verification to complete your login. Please use the verification code below:</p>

    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2b7fff;">{verificationCode}</span>
    </div>

    <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; border-left: 4px solid #2b7fff; margin: 20px 0;">
      <p style="margin: 0;"><strong>Login Details:</strong></p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Device:</strong> {device}</li>
        <li><strong>Location:</strong> {location}</li>
        <li><strong>Time:</strong> {time}</li>
      </ul>
    </div>

    <p>Enter this code on the verification page to complete your login.</p>
    <p>This code will expire in 5 minutes for security reasons.</p>
    <p>If you didn't attempt to log in, please contact our support team immediately.</p>
    <p>Best regards,<br>The Auth App Security Team</p>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>`;

export const SUSPICIOUS_TRANSACTION_ALERT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Suspicious Transaction Activity Detected</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #ff6b35, #f7931e); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">⚠️ Suspicious Transaction Activity</h1>
  </div>

  <div style="background-color: #fff8f8; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hi <strong>{name}</strong>,</p>
    <p>Our security system has detected suspicious activity during a transaction attempt and has temporarily blocked it for your protection.</p>

    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #ff6b35; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; text-align: center; font-size: 28px;">
        🚫
      </div>
    </div>

    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05); margin: 20px 0;">
      <h3 style="margin-top: 0; color: #ff6b35;">Transaction Attempt Details:</h3>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Amount:</strong> {amount}</li>
        <li><strong>Recipient:</strong> {recipient}</li>
        <li><strong>Account Number:</strong> {accountNumber}</li>
        <li><strong>Purpose:</strong> {purpose}</li>
        <li><strong>Device:</strong> {device}</li>
        <li><strong>Browser:</strong> {browser}</li>
        <li><strong>Location:</strong> {location}</li>
        <li><strong>IP Address:</strong> {ip}</li>
        <li><strong>Time:</strong> {time}</li>
        <li><strong>Risk Score:</strong> {riskScore}</li>
      </ul>
    </div>

    <p><strong>What this means:</strong></p>
    <ul>
      <li>Your account is safe and no unauthorized transactions occurred</li>
      <li>The transaction was blocked due to unusual patterns or context</li>
      <li>This could be due to a new device, location, or unusual behavior</li>
    </ul>

    <p><strong>If this was you:</strong></p>
    <ul>
      <li>Try the transaction from a trusted device and location</li>
      <li>Ensure you're using your usual browser and network</li>
      <li>Contact support if you continue to experience issues</li>
    </ul>

    <p><strong>If this wasn't you:</strong></p>
    <ul>
      <li>Your account is already protected</li>
      <li>Consider changing your password as a precaution</li>
      <li>Enable two-factor authentication for additional security</li>
      <li>Contact our support team immediately</li>
    </ul>

    <p>Thank you for helping us keep your account secure!</p>
    <p>Best regards,<br>The Auth App Security Team</p>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>`;

export const TRANSACTION_VERIFICATION_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Transaction Verification Required</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #2b7fff, #8e51ff); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">🔐 Transaction Verification Required</h1>
  </div>

  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hi <strong>{name}</strong>,</p>
    <p>For your security, we require additional verification to complete your transaction. Please use the verification code below:</p>

    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2b7fff;">{verificationCode}</span>
    </div>

    <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; border-left: 4px solid #2b7fff; margin: 20px 0;">
      <p style="margin: 0;"><strong>Transaction Details:</strong></p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li><strong>Amount:</strong> {amount}</li>
        <li><strong>Recipient:</strong> {recipient}</li>
        <li><strong>Account Number:</strong> {accountNumber}</li>
        <li><strong>Purpose:</strong> {purpose}</li>
        <li><strong>Device:</strong> {device}</li>
        <li><strong>Location:</strong> {location}</li>
        <li><strong>Time:</strong> {time}</li>
      </ul>
    </div>

    <p>Enter this code on the verification page to complete your transaction.</p>
    <p>This code will expire in 5 minutes for security reasons.</p>
    <p>If you didn't attempt this transaction, please contact our support team immediately.</p>
    <p>Best regards,<br>The Auth App Security Team</p>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>`;
