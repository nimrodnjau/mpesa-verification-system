# M-Pesa Payment Verification System

A full-stack web application for verifying M-Pesa payments. Users can enter their M-Pesa transaction codes to get instant verification, while businesses can auto-track payments made to their Paybill/Till numbers via webhooks.

---

## 📦 Prerequisites

Before you begin, make sure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| **Python** | 3.8+ | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/downloads) |
| **ngrok** (optional) | Latest | [ngrok.com](https://ngrok.com/download) |

---

## 📥 Step 1: Clone the Repository

```bash
git clone https://github.com/nimrodnjau/mpesa-verification-system.git
cd mpesa-verification-system
```

Your folder structure should look like:
```
mpesa-verification-system/
├── mpesa-backend/
├── mpesa-frontend/
└── README.md
```

---

## 🐍 Step 2: Backend Setup

### 2.1 Navigate to Backend Folder
```bash
cd mpesa-backend
```

### 2.2 Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You'll know it worked when you see `(venv)` in your terminal prompt.

### 2.3 Install Dependencies
```bash
pip install -r requirements.txt
```

### 2.4 Configure Environment Variables

Create a `.env` file in the `mpesa-backend` folder:

**Windows (PowerShell):**
```powershell
New-Item -Path ".env" -ItemType File
notepad .env
```

**Mac/Linux:**
```bash
touch .env
nano .env
```

Add the following to `.env`:
```env
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here-change-this
JWT_SECRET_KEY=your-jwt-secret-key-here-change-this
DATABASE_URL=sqlite:///mpesa.db

# M-Pesa Sandbox Credentials
MPESA_CONSUMER_KEY=your_consumer_key_from_safaricom
MPESA_CONSUMER_SECRET=your_consumer_secret_from_safaricom
MPESA_PASSKEY=your_passkey_from_safaricom
MPESA_SHORTCODE=174379

# Webhook URL (set this when using ngrok)
MPESA_CALLBACK_URL=http://localhost:5000/api/webhook/callback

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

> **Note:** To get M-Pesa sandbox credentials, register at [Safaricom Developer Portal](https://developer.safaricom.co.ke/)

### 2.5 Initialize Database
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 2.6 Create Admin User
```bash
flask create-admin
```
Follow the prompts:
```
Enter admin email: admin@example.com
Enter admin password: admin123
Enter first name: Admin
Enter last name: User
Enter phone number: 0712345678
```

### 2.7 Run Backend Server
```bash
flask run
```

The backend will run at: **http://localhost:5000**

> **Keep this terminal open!**

---

## 🎨 Step 3: Frontend Setup

### 3.1 Open a New Terminal
Open a **new terminal** window (keep the backend running).

### 3.2 Navigate to Frontend Folder
```bash
cd mpesa-frontend
```

### 3.3 Install Dependencies
```bash
npm install
```

### 3.4 Configure Frontend Environment

Create a `.env` file in the `mpesa-frontend` folder:

**Windows (PowerShell):**
```powershell
New-Item -Path ".env" -ItemType File
```

Add this to `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3.5 Run Frontend Server
```bash
npm run dev
```

The frontend will run at: **http://localhost:5173**

> **Keep this terminal open too!**

---

## 🌐 Step 4: Access the Application

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see the home page

---

## 🧪 Step 5: Test the App

### 5.1 Register a User
1. Click **"Register"** in the top navigation
2. Fill in your details
3. Select account type: **Normal User** or **Business**
4. Click **"Create Account"**

### 5.2 Login
1. Click **"Login"**
2. Enter your email and password
3. Click **"Sign In"**

### 5.3 Verify a Payment
1. Go to **"Verify Payment"**
2. Enter any transaction code (e.g., `TEST123`)
3. Enter amount (e.g., `500`)
4. Enter phone number (e.g., `0712345678`)
5. Click **"Verify Payment"**
6. ✅ You'll see a confirmation screen

### 5.4 View Transaction History
1. Go to **"History"** in the navigation
2. See all your past verifications

---

## 🔗 Step 6: Webhook Setup (Optional - For Business Auto-Tracking)

If you want businesses to auto-track payments via webhooks:

### 6.1 Install ngrok

**Windows (winget):**
```bash
winget install Ngrok.Ngrok
```

**Or download from:** https://ngrok.com/download

### 6.2 Start ngrok
```bash
ngrok http 5000
```

You'll see a URL like: `https://abc123.ngrok.io`

### 6.3 Update Backend `.env`
Open `mpesa-backend/.env` and update:
```env
MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/webhook/callback
```

### 6.4 Restart Backend
```bash
# In the backend terminal, press Ctrl+C to stop
# Then restart:
flask run
```

---

## 📋 Command Reference (Quick Summary)

### One-Time Setup
```bash
# Backend
cd mpesa-backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux
pip install -r requirements.txt
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
flask create-admin

# Frontend
cd mpesa-frontend
npm install
```

### Daily Start
```bash
# Terminal 1 - Backend
cd mpesa-backend
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux
flask run

# Terminal 2 - Frontend
cd mpesa-frontend
npm run dev

# Terminal 3 - ngrok (optional)
ngrok http 5000
```

---

## 🔧 Troubleshooting

### Backend Issues

| Problem | Solution |
|---------|----------|
| `flask: command not found` | Activate virtual environment: `venv\Scripts\activate` |
| `ModuleNotFoundError` | Install dependencies: `pip install -r requirements.txt` |
| `Port 5000 already in use` | Use a different port: `flask run --port=5001` |
| `JWT_SECRET_KEY not set` | Make sure `.env` exists and has `JWT_SECRET_KEY` |
| `SQLite error` | Delete `mpesa.db` and run migrations again |

### Frontend Issues

| Problem | Solution |
|---------|----------|
| `npm: command not found` | Install Node.js from nodejs.org |
| `Module not found` | Delete `node_modules` and `package-lock.json`, then `npm install` |
| `CORS error` | Check `CORS_ORIGINS` in backend `.env` includes `http://localhost:5173` |
| `API not responding` | Make sure backend is running on `http://localhost:5000` |

### Token/Auth Issues

| Problem | Solution |
|---------|----------|
| `Subject must be a string` | Logout and login again, or restart Flask |
| `Token expired` | Login again to get a new token |
| `Invalid credentials` | Check email and password, or create a new user |

---

## 📊 Environment Variables Reference

### Backend `.env` (`mpesa-backend/.env`)
```env
FLASK_APP=run.py                # Entry point
FLASK_ENV=development           # development | production
SECRET_KEY=your-secret-key      # Flask secret
JWT_SECRET_KEY=your-jwt-secret  # JWT signing key
DATABASE_URL=sqlite:///mpesa.db # Database connection

# M-Pesa (optional for testing)
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=your_ngrok_url/api/webhook/callback

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend `.env` (`mpesa-frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Quick Start (All Commands)

```bash
# === BACKEND ===
cd mpesa-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
flask create-admin
flask run

# === FRONTEND ===
# Open a new terminal
cd mpesa-frontend
npm install
npm run dev

# === OPEN APP ===
# Go to: http://localhost:5173
```

---

## 📝 License

MIT

## 👨‍💻 Author

**Nimrod Njau Kibe**
- SCNI/02234/2024
