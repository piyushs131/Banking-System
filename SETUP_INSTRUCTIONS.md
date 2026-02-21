# Banking System - Setup & Run Instructions

## Prerequisites
- **Node.js** v18+
- **MongoDB** - Local (`mongodb://127.0.0.1:27017`) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier)

## Quick Start

### 1. Start Backend
```bash
cd Banking-System/Backend
npm install   # Already done
npm start
```
Backend runs at **http://localhost:5000**

### 2. Start Frontend (in a new terminal)
```bash
cd Banking-System/Frontend
npm install   # Already done
npm run dev
```
Frontend runs at **http://localhost:5173** (or 5174 if 5173 is in use)

### 3. Open the App
Visit **http://localhost:5173** (or http://localhost:5174) in your browser.

## Configuration
- Backend `.env` is pre-configured with development defaults.
- To use MongoDB Atlas: Update `MONGO_URL` in `Backend/.env`
- Blockchain (Ganache) is optional - app works in fallback mode without it.

## Optional Services
- **ML Mouse Analysis** (port 5001): `cd ML-Models && pip install flask flask-cors pandas joblib scikit-learn && python app.py`
- **Blockchain**: Run `ganache` for full blockchain audit trail
