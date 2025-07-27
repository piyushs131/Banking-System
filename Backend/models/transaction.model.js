import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  ifsc: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: 'Success',
  },

  // ✅ NEW FIELDS FOR BLOCKCHAIN
  txHash: {
    type: String,
    required: false, // Optional at first (in case blockchain fails)
  },
  validated: {
    type: Boolean,
    default: false,
  },
  chainStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Failed', 'NotConfigured', 'OffChain', 'OnChain'],
    default: 'Pending',
  },
  blockchainLog: {
    type: Object,
    required: false,
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
