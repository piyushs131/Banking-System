import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now(),
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,

    // MFA fields
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaSecret: String,
    mfaTempCode: String,
    mfaTempCodeExpiresAt: Date,

    // Security fields
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: Date,

    // Login activity
    loginHistory: [
      {
        date: Date,
        ip: String,
        userAgent: String,
        location: String,
        successful: Boolean,
      }
    ],

    // Transaction verification fields
    transactionVerificationToken: String,
    transactionVerificationExpiresAt: Date,
    pendingTransaction: {
      amount: Number,
      recipient: String,
      accountNumber: String,
      ifsc: String,
      purpose: String,
      note: {
        type: String,
        default: ""
      },
      context: {
        type: Object,
        default: {}
      },
      useBlockchain: {
        type: Boolean,
        default: false
      }
    },

    // Context-Driven Intelligence fields:
    trustedDevices: {
      type: [String], // e.g., ['MacOS Safari', 'iPhone 14']
      default: [],
    },
    trustedIPs: {
      type: [String], // e.g., ['123.45.67.89']
      default: [],
    },
    locations: {
      type: [
        {
          lat: Number,
          lon: Number,
        },
      ], // e.g., [{ lat: 37.7749, lon: -122.4194 }]
      default: [],
    },
    // Optional: store baseline behavioral metrics
    behavioralProfile: {
      typingSpeed: {
        type: Number, // average ms between keystrokes
        default: null,
      },
      cursorPatternHash: {
        type: String, // hashed representation of cursor movement signature
        default: null,
      },
      typicalLoginHours: {
        type: [Number], // e.g., [9,10,11,14]
        default: [],
      },
    },
    // Optional: historical context logs for audit
    contextLogs: {
      type: [
        {
          ip: String,
          device: String,
          location: {
            lat: Number,
            lon: Number,
            locationName: String, // e.g., 'San Francisco
          },
          timestamp: Date,
          riskScore: Number,
        },
      ],
      default: [],
    },
    riskScore: {
      type: Number, // cumulative risk score based on context evaluation
      default: 0
    },
    fullName: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    dob: { type: Date },
    
    // Banking details
    accountNumber: {
      type: String,
      unique: true,
      required: true,
    },
    ifscCode: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 10000, // Starting balance of ₹10,000
      min: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
