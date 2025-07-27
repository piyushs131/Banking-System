// transaction.routes.js

import express from 'express';
import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';
import verifyToken from '../middleware/verifyToken.js';
import { evaluateContext } from '../utils/contextEvaluator.js';
import { updateContextProfile } from '../utils/updateContextProfile.js';
import { sendSuspiciousTransactionAlert, sendTransactionVerificationEmail } from '../nodemailer/emails.js';
import { generateVerificationCode } from '../utils/generateVerificationCode.js';
import {
  getUserTransactions,
  getIncomingTransactions,
  getTransactionStats,
  getUserBalance,
  createTransaction,
  verifyTransaction, // ✅ Controller with blockchain integration
} from '../controller/transaction.controller.js';

const router = express.Router();

//////////////////////////////////
// ✅ ROUTE 1: GET Transactions
//////////////////////////////////

// Use controller to get user's transactions
router.get('/', verifyToken, getUserTransactions);

// Get incoming transactions (where user is the recipient)
router.get('/incoming', verifyToken, getIncomingTransactions);

// Get transaction statistics
router.get('/stats', verifyToken, getTransactionStats);

// Get user balance
router.get('/balance', verifyToken, getUserBalance);

//////////////////////////////////
// ✅ ROUTE 2: BASIC Create Transaction (MongoDB only) with Context Checking
// You already had this, and we keep it. Users who don't use blockchain can still make transactions.
//////////////////////////////////
router.post('/', verifyToken, async (req, res) => {
  try {
    const { amount, recipientAccountNumber, purpose, note, context, useBlockchain } = req.body;
    
    // console.log('Received transaction data:', req.body);

    // Basic input validation
    if (!amount || !recipientAccountNumber || !purpose) {
      console.log('Missing required fields:', { amount, recipientAccountNumber, purpose });
      return res.status(400).json({ error: 'Amount, recipient account number, and purpose are required' });
    }

    // Find recipient user by account number
    const recipientUser = await User.findOne({ accountNumber: recipientAccountNumber });
    if (!recipientUser) {
      return res.status(404).json({ error: 'Recipient account not found' });
    }

    // Check if sender has sufficient balance
    const sender = await User.findById(req.userId);
    if (!sender) {
      return res.status(404).json({ error: 'Sender account not found' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance for this transaction' });
    }

    // Prevent self-transaction
    if (recipientUser._id.toString() === req.userId) {
      return res.status(400).json({ error: 'Cannot send money to yourself' });
    }

    // Context-based security check
    if (context) {
      try {
        // Get user profile for context evaluation
        const user = await User.findById(req.userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Evaluate context and calculate risk score
        const risk = evaluateContext(context, user);

        // Risk-based transaction logic
        if (risk >= 10) {
          // Block transaction and send warning email for high risk
          await sendSuspiciousTransactionAlert(
            user.email,
            user.name,
            context,
            risk,
            { amount, recipient: recipientUser.name, accountNumber: recipientAccountNumber, purpose }
          );
          return res.status(403).json({
            success: false,
            message: "Suspicious activity detected, transaction blocked for your security. Check your email for details.",
            riskScore: risk
          });
        } else if (risk >= 5 && amount > 10000) {
          // Check if user already has a pending verification
          if (user.transactionVerificationToken && user.transactionVerificationExpiresAt > Date.now()) {
            return res.status(200).json({
              success: false,
              message: "Verification already in progress. Please check your email for the verification code.",
              requireVerification: true,
              riskScore: risk
            });
          }
          
          // Require additional verification for medium risk
          const verificationCode = generateVerificationCode();
          
          // Store pending transaction and verification token
          user.transactionVerificationToken = verificationCode;
          user.transactionVerificationExpiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
          user.pendingTransaction = {
            amount,
            recipient: recipientUser.name,
            accountNumber: recipientAccountNumber,
            ifsc: recipientUser.ifscCode,
            purpose,
            note,
            context,
            useBlockchain: useBlockchain || false
          };
          
          // Debug: Log what we're storing
          console.log('Storing pending transaction:', user.pendingTransaction);
          
          await user.save();

          // Send verification email
          await sendTransactionVerificationEmail(
            user.email,
            user.name,
            verificationCode,
            context,
            { amount, recipient: recipientUser.name, accountNumber: recipientAccountNumber, purpose }
          );

          return res.status(200).json({
            success: false,
            message: "Additional verification required due to unusual activity. Check your email for the verification code.",
            requireVerification: true,
            riskScore: risk
          });
        }

        // Update user's context profile with this transaction attempt
        await updateContextProfile(user, context, risk);
      } catch (error) {
        console.error("Error evaluating context:", error);
        // Continue with transaction even if context evaluation fails
      }
    }

    // Update balances
    await User.findByIdAndUpdate(req.userId, { $inc: { balance: -amount } });
    await User.findByIdAndUpdate(recipientUser._id, { $inc: { balance: amount } });

    const newTransaction = new Transaction({
      userId: req.userId,
      amount,
      recipient: recipientUser.name,
      recipientId: recipientUser._id,
      accountNumber: recipientAccountNumber,
      ifsc: recipientUser.ifscCode,
      purpose,
      note,
      date: new Date(),
      status: 'Success (No Blockchain)',
    });

    console.log('Saving transaction:', newTransaction);
    await newTransaction.save();
    console.log('Transaction saved successfully');
    
    res.status(201).json({
      success: true,
      message: 'Transaction completed successfully',
      transaction: newTransaction
    });
  } catch (err) {
    console.error('Transaction Error:', err);
    res.status(500).json({ error: 'Transaction Failed' });
  }
});

//////////////////////////////////
// ➕ ROUTE 3: Blockchain + Database Transaction (Controller-based)
//////////////////////////////////

// Use extended controller to create + validate tx on Ethereum and save to MongoDB
router.post('/create', verifyToken, createTransaction);

//////////////////////////////////
// ➕ ROUTE 4: Transaction Verification
//////////////////////////////////

// Verify transaction with verification code
router.post('/verify', verifyToken, verifyTransaction);

export default router;
