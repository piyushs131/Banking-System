import crypto from 'crypto';

// Generate a unique 12-digit account number
export const generateAccountNumber = () => {
  // Generate a random 12-digit number
  const randomDigits = crypto.randomInt(100000000000, 999999999999).toString();
  return randomDigits;
};

// Generate a valid IFSC code (4 letters + 7 digits)
export const generateIFSCCode = () => {
  // Common bank codes (first 4 letters)
  const bankCodes = [
    'HDFC', 'ICIC', 'SBIN', 'AXIS', 'PNBA', 'IDIB', 'KARB', 'BARB',
    'UNIB', 'IOBA', 'CNRB', 'PSIB', 'UCBA', 'VIJB', 'JANA', 'KGBK'
  ];
  
  // Randomly select a bank code
  const bankCode = bankCodes[Math.floor(Math.random() * bankCodes.length)];
  
  // Generate 7 random digits
  const branchCode = crypto.randomInt(1000000, 9999999).toString();
  
  return bankCode + branchCode;
};

// Generate complete account details
export const generateAccountDetails = () => {
  const accountNumber = generateAccountNumber();
  const ifscCode = generateIFSCCode();
  
  return {
    accountNumber,
    ifscCode
  };
};

// Validate account number format (12 digits)
export const validateAccountNumber = (accountNumber) => {
  const accountNumberRegex = /^\d{12}$/;
  return accountNumberRegex.test(accountNumber);
};

// Validate IFSC code format (4 letters + 7 digits)
export const validateIFSCCode = (ifscCode) => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifscCode);
}; 