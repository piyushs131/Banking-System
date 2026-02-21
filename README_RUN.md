# Banking Fraud Detection - Run Everything

## Quick Start (One Command)

**Option 1 - Double-click:** Open File Explorer, go to `Banking-System` folder, double-click `run-all.bat`

**Option 2 - From terminal:**
```powershell
cd Banking-System
.\run.ps1
```
Or with CMD/PowerShell:
```bash
cd Banking-System
cmd /c run-all.bat
```
> **Note:** In PowerShell, use `.\run.ps1` or `cmd /c run-all.bat`. Plain `run-all.bat` may cause errors.

**Option 3 - PowerShell script:**
```powershell
cd Banking-System
.\run-all.ps1
```

This starts:
- **Ganache** (Blockchain) - port 8545
- **Backend** (Node.js) - port 5000  
- **ML Service** (Flask/Python) - port 5001
- **Frontend** (Vite/React) - port 5173

Then open **http://localhost:5173** in your browser.

---

## Manual Start (4 Terminals)

### Terminal 1: Ganache (Blockchain)
```bash
npx ganache-cli -p 8545 -d
```
Wait for "Listening on 127.0.0.1:8545"

### Terminal 2: Deploy Contract (once Ganache is up)
```bash
node scripts/deploy-and-update.js
```

### Terminal 3: Backend
```bash
cd Backend
npm start
```

### Terminal 4: ML Service
```bash
cd ML-Models
pip install -r requirements.txt
python app.py
```

### Terminal 5: Frontend
```bash
cd Frontend
npm run dev
```

---

## Prerequisites

- **Node.js** v18+
- **Python** 3.8+ (with pip)
- **MongoDB** Atlas (configured in Backend/.env)

## Python ML Dependencies
```bash
cd ML-Models
pip install -r requirements.txt
```

## Blockchain
- Install: `npm install -g ganache-cli`
- Or use `npx ganache-cli` (no install needed)
