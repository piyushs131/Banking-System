# Banking Fraud Detection - Technical Documentation

## **📌 Problem Statement & The Challenge**

Online banking and cashless transactions are now part of daily life, but traditional security measures like passwords and OTPs are no longer enough. Hackers continuously adapt, putting users at constant risk and causing frustration due to outdated verification methods.

**The challenge** is to build a smarter, more adaptive system that ensures strong protection without disrupting user experience.

---

## **🎯 Project Objective**

To build a modern banking platform that uses **smart, invisible security** powered by machine learning and blockchain to:

- 💳 Let users bank, pay, and book effortlessly and securely.
- 🧠 Continuously learn behavior patterns to verify authenticity silently.
- 🚨 Detect fraud in real-time and take action only when necessary.
- 🔐 Preserve user privacy while providing full traceability of actions.

---

## **🧠 What Our Solution Does**

### ✅ **How It Works**

1. **Learns Your Routine:**  
   Tracks behavioral patterns like typing speed, mouse movement, swipe gestures, device, browser, and location.

2. **Smarter Protection:**  
   Each action (login, transfer, booking) is verified using machine learning to detect anomalies or suspicious behavior.

3. **Adapts Over Time:**  
   Continuously improves its accuracy as it learns your personal habits.

4. **Invisible Until Needed:**  
   No friction unless something suspicious happens—then you're asked to verify or the session is secured automatically.

5. **Blockchain Audit Trail:**  
   All major events are permanently recorded using blockchain to ensure transparency and tamper-proof tracking.

---

## **🚀 Main Features**

- **Behavioral Biometrics:**  
  Authenticates users based on how they interact with the system, not just passwords.

- **Anomaly Detection:**  
  Detects out-of-pattern behaviors like logging in from a new country or using a different device.

- **Smart TAN Verification:**  
  Sends one-time secure codes for high-risk actions to prevent fraud.

- **Session Protection:**  
  Prevents risky activities such as switching tabs during transactions or using automation tools.

- **Live Alerts:**  
  Sends instant SMS/email notifications and locks accounts if threats are detected.

- **Blockchain Audit Trail:**  
  Logs all critical events in a secure, tamper-proof way for full traceability.

---

## **🌍 Scope & Impact**

- **All-in-One Security:**  
  Covers everything from online banking to ticket bookings in one secure environment.

- **Scalable by Design:**  
  Built to protect millions of users with personalized security profiles.

- **Regulation-Ready & Trustworthy:**  
  Designed to meet financial regulations and ensure every user action is genuine and traceable.

---


## Project Structure

    Banking-Fraud-Detection/
    │
    ├── Backend/
    │   ├── .env
    │   ├── index.js
    │   ├── package.json
    │   └── ... (controllers, models, routes, utils, etc.)
    │
    └── Frontend/
        ├── package.json
        ├── vite.config.js
        └── src/
            └── ... (React components, pages, assets, etc.)

## Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)
- MongoDB Atlas account (or local MongoDB instance)

---

## Backend Initialization

1. **Navigate to the Backend directory:**
   ```sh
   cd Backend
2. **Install dependencies:**
   ```sh
   npm install
3. **Create a .env file in the Backend directory:**
    See the Example .env section below.

4. **Start the backend server:**
    ```sh
    npm start
The app will run on http://localhost:5173 by default.

## Example .env File
Create a .env file in the Backend directory with the following content:

    MONGO_URL=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    CLIENT_URL=http://localhost:5173
    MAIL_USER=your_smtp_user
    MAIL_PASS=your_smtp_password
    NODE_ENV=development
    RECAPTCHA_SECRET_KEY=your_recaptcha_key_here

### Additional Notes
- The backend uses JWT for authentication and cookies for session management.
- Email features use SMTP.
- Update .env with your own credentials for production use.

For more details, see the code in index.js and App.jsx.

## Frontend Set-up Instruction

1. **Install Dependencies**
    ```sh
    npm install

2.  **Run the Frontend**
    ```sh
    npm run dev
  

## Flask Mouse Analysis Service Setup

If you are using the mouse movement anomaly detection service (`app.py` in `ML-Models`):

1. **Install Python dependencies:**
   ```sh
   pip install flask flask-cors pandas joblib scikit-learn

2. **Run the Flask service:**
    ```sh
    python app.py

## Blockchain Set-up

 Start the Blockchain Server using ganache,Redhat

 1. **Install All dependencied**
    ```sh
    npm install -g ganache

2. **Run the Server**
   ```sh
   ganache
