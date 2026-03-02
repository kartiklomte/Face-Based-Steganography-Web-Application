# ✅ Complete Setup Checklist

Use this checklist to ensure everything is properly configured before running the application.

## 🔧 Pre-Setup Requirements

- [ ] Python 3.8 or higher installed (`python --version`)
- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] MongoDB Atlas account created (free tier available)
- [ ] Gmail account (for email sharing feature)
- [ ] Git installed (optional, for version control)
- [ ] A code editor (VS Code recommended)

## 📋 Step 1: MongoDB Atlas Setup

### Create MongoDB Cluster

- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Sign up for free account (or log in)
- [ ] Create a new project
- [ ] Create a cluster:
- [ ] Choose free tier (M0)
- [ ] Select region closest to you
- [ ] Cluster name: `steganography-cluster` (or similar)
- [ ] Wait for cluster to initialize (~5-10 min)

### Configure Database Access

- [ ] Go to "Database Access" in left menu
- [ ] Click "Add New Database User"
- [ ] Create username: `steganography_user` (or preferred)
- [ ] Create password: Use strong password (save it!)
- [ ] Select "Read and write to any database"
- [ ] Click "Add User"

### Configure Network Access

- [ ] Go to "Network Access" in left menu
- [ ] Click "Add IP Address"
- [ ] Select "Allow access from anywhere" (for development)
  - ⚠️ For production: Add specific IP addresses
- [ ] Click "Confirm"

### Get Connection String

- [ ] Go back to "Databases" / Clusters
- [ ] Click "Connect" on your cluster
- [ ] Choose "Connect your application"
- [ ] Select Python 3.6 or later
- [ ] Copy the connection string
- [ ] Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/steganography_db?retryWrites=true&w=majority`
- [ ] Replace `<password>` and `<username>` with your credentials

## 🔑 Step 2: Gmail Configuration (Optional but Recommended)

### Enable 2-Factor Authentication

- [ ] Go to https://myaccount.google.com
- [ ] Click "Security" in left menu
- [ ] Enable 2-Step Verification
- [ ] Save recovery codes

### Create App Password

- [ ] Go back to Security settings
- [ ] Click "App passwords" (appears after 2FA enabled)
- [ ] Select "Mail" and "Windows Computer"
- [ ] Click "Generate"
- [ ] Copy the generated password (16 characters)
- [ ] Save it securely

## 📦 Step 3: Backend Setup

### Navigate to Backend Directory

```bash
cd project\backend
```

- [ ] Verify you're in the backend directory
- [ ] Check `ls` shows: `main.py`, `requirements.txt`, etc.

### Create Virtual Environment

```bash
# Windows
py -3.10 -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

- [ ] Virtual environment created
- [ ] Virtual environment activated
- [ ] Prompt shows `(venv)` prefix

### Install Dependencies

1. install the visual studio build 2022
   - In this add the c++ for the destop.

2. install the cmake version 3.24.4

### inside the x64 Native Tool Command 2022:
Go to the adderess and enter the below command
venv\Scripts\activate
pip install "setuptools<60"
pip install "wheel<0.38"
pip install "numpy<2"
pip install dlib==19.24.2 --no-build-isolation

### now enter the reaming command in the termainal of the vs code
```bash
1. cd backend 
2. venv\Scripts\activate
3. python -m pip install --upgrade pip setuptools wheel
4. pip install numpy==1.26.4
5. pip install dlib==19.24.2
6. pip install face-recognition
7. pip install fastapi uvicorn pymongo python-dotenv pydantic email-validator passlib[bcrypt] python-multipart email-validator "python-jose[cryptography]"
8. pip install cmake
9. pip install git+https://github.com/ageitgey/face_recognition_models

in the new terminal:
git clone https://github.com/ageitgey/face_recognition_models.git

in old terminal:
10. cd face_recognition_models
11. pip install .
12. pip install setuptools==68.2.2



```

- [ ] All packages installed successfully
- [ ] No error messages
- [ ] Takes ~3-5 minutes


### Configure Environment Variables

Create/Update `.env` file in backend directory:

```env
# Copy from .env.example or fill in:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/steganography_db?retryWrites=true&w=majority
SECRET_KEY=your_super_secret_key_min_32_chars_use_secrets_module
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_app_password_16_chars
FACE_RECOGNITION_THRESHOLD=0.6
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

Checklist:
- [ ] `.env` file created in backend directory
- [ ] `MONGODB_URI` filled with actual connection string
- [ ] `SECRET_KEY` is a strong random string (32+ chars)
- [ ] `SENDER_EMAIL` is valid Gmail address
- [ ] `SENDER_PASSWORD` is 16-character app password
- [ ] All required fields have values
- [ ] No quotes around values (except in URI if needed)

### Generate Secure Secret Key

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

- [ ] Secret key generated
- [ ] Copy and paste into `SECRET_KEY` in `.env`

### Test Backend Connection

```bash
python -c "from database import database; print('MongoDB connection OK')"
```

- [ ] No error message
- [ ] Prints: "MongoDB connection OK"

## 🚀 Step 4: Frontend Setup

### Navigate to Frontend Directory

```bash
cd project\frontend
```

- [ ] Changed to frontend directory
- [ ] Verify `ls` shows: `package.json`, `vite.config.js`, etc.

### Install Dependencies

```bash
npm install
```

- [ ] All packages installed successfully
- [ ] `node_modules` directory created
- [ ] Takes ~2-3 minutes

Verify installation:
```bash
npm list react
```

- [ ] React listed with version

### Configure Environment Variables

Update `.env` file in frontend directory:

```env
VITE_API_URL=http://localhost:8000
```

Checklist:
- [ ] `.env` file exists in frontend directory
- [ ] `VITE_API_URL` is set to backend URL
- [ ] No trailing slash after URL

## ▶️ Step 5: Run the Application

### Terminal 1 - Start Backend

```bash
cd project\backend

# Windows (with venv activated)
venv\Scripts\activate
python main.py

# macOS/Linux
source venv/bin/activate
python main.py
```

Verify backend started:
- [ ] No errors in console
- [ ] Message: "Uvicorn running on http://0.0.0.0:8000"
- [ ] Can access http://localhost:8000 in browser

### Terminal 2 - Start Frontend

```bash
cd project\frontend
npm run dev
```

Verify frontend started:
- [ ] No errors in console
- [ ] Message: "Local: http://localhost:5173"
- [ ] Can access http://localhost:5173 in browser

## 🧪 Step 6: Test the Application

### Test API Health

- [ ] Open http://localhost:8000 in browser
- [ ] See: `{"message":"Welcome to Secure Steganography API"}`
- [ ] Open http://localhost:8000/health
- [ ] See: `{"status":"healthy"}`

### Test Frontend Load

- [ ] Open http://localhost:5173 in browser
- [ ] Page loads successfully
- [ ] No console errors
- [ ] Can see home page with buttons

### Test User Registration

1. Click "Register Now"
2. Fill in form:
   - [ ] Name: Test User
   - [ ] Email: test@example.com
   - [ ] Password: StrongPassword123
   - [ ] Face: Upload or capture from webcam
   - [ ] Click "Register"
3. Verify:
   - [ ] No errors
   - [ ] Redirected to Dashboard
   - [ ] Welcome message shows username

### Test User Login

1. Logout by clicking logout button
2. Click "Login"
3. Fill in form:
   - [ ] Email: test@example.com
   - [ ] Password: StrongPassword123
   - [ ] Face: Same face image (webcam or file)
   - [ ] Click "Login"
4. Verify:
   - [ ] No errors
   - [ ] Redirected to Dashboard
   - [ ] Same user profile shown

### Test Send Message

1. From Dashboard, click "Send Secure Message"
2. Fill in form:
   - [ ] Receiver Email: another_user@example.com (or existing email)
   - [ ] Secret Message: "This is a secret test message"
   - [ ] Image: Select any image file
   - [ ] Click "Embed Message"
3. Verify:
   - [ ] Encryption key displayed
   - [ ] Can copy key to clipboard
   - [ ] Can download stego image
   - [ ] Can share via email button (if SMTP configured)

### Test Extract Message

1. From Dashboard, click "Extract Secure Message"
2. Upload the stego image you just downloaded
3. Paste the encryption key
4. Click "Extract Message"
5. Verify:
   - [ ] Original message displayed: "This is a secret test message"
   - [ ] Can copy message to clipboard

## 🔍 Step 7: Verify Database

### Check MongoDB Collections

```bash
# Using MongoDB Compass or Atlas web UI
# Go to: Databases > steganography_db

- [ ] `users` collection exists and has user documents
- [ ] Each user has: name, email, password_hash, face_encoding[]
- [ ] `messages` collection exists
- [ ] Each message has: sender_id, receiver_email, encrypted_message, encryption_key
```

## 🐛 Step 8: Troubleshooting

### Backend Won't Start

Checklist:
- [ ] `MONGODB_URI` is correct (test in MongoDB Compass)
- [ ] Port 8000 is not in use (`netstat -ano | findstr 8000`)
- [ ] Python version is 3.8+ (`python --version`)
- [ ] All dependencies installed (`pip list`)
- [ ] `.env` file is in `backend` directory

Solution:
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in .env
SERVER_PORT=8001
```

### Frontend Won't Load

Checklist:
- [ ] Node modules installed (`npm install`)
- [ ] Port 5173 not in use
- [ ] Vite config correct
- [ ] `.env` has `VITE_API_URL=http://localhost:8000`

Solution:
```bash
npm install
npm run dev -- --port 5173
```

### Face Recognition Not Working

Checklist:
- [ ] Image has clear, frontal face
- [ ] Lighting is good
- [ ] `face_recognition` library installed
- [ ] No dlib errors

Solution:
- Use different lighting
- Get closer to camera
- Try different image

### MongoDB Connection Fails

Checklist:
- [ ] Username and password correct
- [ ] IP whitelisted in Atlas UI
- [ ] Connection string format correct
- [ ] Network available

Solution:
```bash
# Test connection
python -c "from pymongo import MongoClient; client = MongoClient('YOUR_URI'); print(client.admin.command('ping'))"
```

### Email Not Sending

Checklist:
- [ ] Gmail SMTP credentials correct
- [ ] Using App Password (not main password)
- [ ] 2FA enabled on Gmail
- [ ] Correct SMTP settings:
  - [ ] Server: smtp.gmail.com
  - [ ] Port: 587
  - [ ] TLS: Enabled

## ✅ Final Verification

Run through this final checklist:

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173
- [ ] Can register new user
- [ ] Can login with face recognition
- [ ] Can send message with embed
- [ ] Can extract message with decryption
- [ ] MongoDB stores all data
- [ ] No console errors
- [ ] All environment variables set
- [ ] Can access both applications

## 🎉 You're All Set!

If you've completed all checklist items, your application is ready to use!

### Quick Commands Reference

```bash
# Start backend
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
python main.py

# Start frontend (in another terminal)
cd frontend
npm run dev

# Open browser
http://localhost:5173
```

### Next Steps

1. **Customize**: Modify colors/styling in `frontend/src/index.css`
2. **Deploy**: Push to GitHub and deploy to cloud
3. **Enhance**: Add features like 2FA, password reset, etc.
4. **Test**: Create multiple users and exchange messages
5. **Monitor**: Set up error tracking (Sentry)

### Support

For issues:
1. Check this checklist again
2. Review error messages carefully
3. Check console (F12) for errors
4. Review README.md and ARCHITECTURE.md
5. Check backend logs for API errors

Happy secure messaging! 🔐✉️
