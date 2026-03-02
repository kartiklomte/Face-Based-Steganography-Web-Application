# 🔐 Secure Face-Based Steganography Web Application

A full-stack web application that combines face recognition, AES encryption, and LSB steganography to securely send encrypted messages hidden inside images. Only the intended recipient can extract and decrypt the message.

## ✨ Features

- **🎯 Face Recognition Authentication**: Secure login using facial recognition with face_recognition library
- **🔒 AES-256 Encryption**: Military-grade encryption for messages using the cryptography library
- **🖼️ LSB Steganography**: Hide encrypted messages in images using Least Significant Bit technique
- **📧 Email Sharing**: Send stego images directly via email with encryption keys
- **🛡️ JWT Authentication**: Secure API endpoints with JWT tokens
- **🗄️ MongoDB Atlas**: Cloud database for storing users and messages
- **⚡ Modern Stack**: React + Vite frontend with FastAPI backend

## 🏗️ Project Structure

```
/project-root
├── /backend
│   ├── main.py                 # FastAPI application entry point
│   ├── database.py             # MongoDB connection setup
│   ├── requirements.txt         # Python dependencies
│   ├── .env                    # Environment variables (Create from .env.example)
│   │
│   ├── /models
│   │   └── __init__.py         # Pydantic request/response schemas
│   │
│   ├── /routes
│   │   ├── auth_routes.py      # Register and Login endpoints
│   │   └── message_routes.py   # Embed, Extract, Share endpoints
│   │
│   ├── /services
│   │   ├── auth_service.py     # JWT and password hashing
│   │   ├── face_service.py     # Face recognition logic
│   │   ├── encryption_service.py # AES encryption/decryption
│   │   ├── steganography_service.py # LSB embed/extract
│   │   └── email_service.py    # SMTP email sending
│   │
│   └── /utils
│       └── helpers.py          # Utility functions
│
├── /frontend
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── postcss.config.js       # PostCSS configuration
│   ├── index.html              # HTML entry point
│   ├── .env                    # Frontend environment variables
│   │
│   └── /src
│       ├── App.jsx             # Main React component with routing
│       ├── main.jsx            # React entry point
│       ├── index.css           # Global styles
│       │
│       ├── /components
│       │   ├── Header.jsx      # Navigation header
│       │   ├── PrivateRoute.jsx # Protected route component
│       │   └── WebcamCapture.jsx # Webcam face capture
│       │
│       ├── /pages
│       │   ├── Home.jsx        # Landing page
│       │   ├── Register.jsx    # User registration
│       │   ├── Login.jsx       # User login
│       │   ├── Dashboard.jsx   # Main dashboard
│       │   ├── SendMessage.jsx # Send secure message
│       │   └── ReceiveMessage.jsx # Extract message
│       │
│       └── /utils
│           ├── api.js          # API client functions
│           └── auth.js         # Authentication utilities
│
└── README.md                   # This file
```

## 🔐 Security Architecture

### Authentication Flow
1. User registers with email, password, and face image
2. Face encoding extracted using face_recognition library
3. Password hashed with bcrypt
4. On login: password + face verification required (threshold: 0.6)
5. JWT token issued on successful authentication

### Message Security
1. **Encryption**: Message encrypted with AES using Fernet
2. **Steganography**: Encrypted message hidden in image using LSB
3. **Key Management**: Unique AES key generated for each message
4. **Access Control**: Only intended receiver can extract with proper key

### Database
- **MongoDB Atlas** with unique email indexes
- User face encodings stored as arrays of floats
- Message metadata (sender, receiver, timestamps) logged

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8+ for backend
- Node.js 16+ for frontend
- MongoDB Atlas account
- Gmail account (for email testing, optional)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create and activate virtual environment**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
   - Copy `.env` file or create one with:
```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/steganography_db?retryWrites=true&w=majority

# JWT Configuration
SECRET_KEY=your_super_secret_key_change_this_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration (Gmail SMTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_app_specific_password

# Face Recognition Threshold
FACE_RECOGNITION_THRESHOLD=0.6

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

5. **Run backend server**
```bash
python main.py
```
Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
   - Update `.env` file:
```env
VITE_API_URL=http://localhost:8000
```

4. **Start development server**
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

## 📖 API Endpoints

### Authentication
- `POST /api/register` - Register new user with face image
- `POST /api/login` - Login with email, password, and face verification

### Messages (Protected - Requires JWT)
- `POST /api/embed` - Embed encrypted message in image
- `POST /api/extract` - Extract and decrypt message from stego image
- `POST /api/share-email` - Send stego image via email
- `GET /api/messages` - Get all received messages

### Health Check
- `GET /` - API status
- `GET /health` - Health check endpoint

## 🎯 Usage Example

### Sending a Secure Message

1. **Register/Login**
   - Create account with face recognition
   - Face encoding automatically stored

2. **Send Message**
   - Fill in receiver email
   - Write your secret message
   - Select an image to embed in
   - Click "Embed Message"

3. **Share**
   - Download stego image OR
   - Share via email (encryption key included)

### Receiving a Secure Message

1. **Extract Message**
   - Upload received stego image
   - Paste the encryption key
   - Click "Extract Message"

2. **View/Copy**
   - Read the decrypted message
   - Copy to clipboard if needed

## 🛠️ Technical Details

### Face Recognition
- Uses `face_recognition` library (dlib-based)
- Extracts 128-D face encodings
- Threshold distance: 0.6 for authentication
- Real-time webcam capture support

### Encryption
- Algorithm: Fernet (AES-128)
- Mode: CBC with PKCS7 padding
- Key derivation: Random generation with os.urandom
- Message format: Base64 encoded for transmission

### Steganography
- Method: LSB (Least Significant Bit)
- Capacity: Depends on image dimensions
- Format: PNG for lossless storage
- Header: 32-bit message length prefix

### Email Service
- Protocol: SMTP with TLS
- Provider: Gmail (configurable)
- Attachment: Stego image (PNG)
- Content: Encryption key in email body

## 🔄 Workflow Diagram

```
User Registration
    ↓
[Face capture] → [Extract encoding] → [Hash password] → [Store in DB]
    ↓
User Login
    ↓
[Face capture] → [Compare encodings] → [Verify password] → [Issue JWT]
    ↓
Send Message
    ↓
[Select image] → [Message] → [Generate AES key] → [Encrypt] → [Hide in image via LSB]
    ↓
[Download stego] or [Send via email]
    ↓
Receive Message
    ↓
[Stego image] + [AES key] → [Extract from LSB] → [Decrypt] → [View message]
```

## 📝 Key Components Explained

### Face Recognition Service (`face_service.py`)
- Extracts 128-dimensional face encodings
- Compares encodings with configurable threshold
- Returns True/False for face match

### Encryption Service (`encryption_service.py`)
- Generates random AES keys
- Encrypts plain text messages
- Decrypts with provided keys
- Handles Fernet exceptions

### Steganography Service (`steganography_service.py`)
- Converts messages to binary
- Embeds in LSB of pixel values
- Extracts bit-by-bit from image
- Length-prefixed for recovery

### Email Service (`email_service.py`)
- Sends SMTP emails via Gmail
- Attaches stego image
- Includes encryption key in body
- Error handling for SMTP failures

## ⚠️ Important Notes

1. **MongoDB Atlas Setup**
   - Create cluster on Atlas
   - Add IP to whitelist
   - Generate connection string
   - Update in .env

2. **Gmail Configuration**
   - Enable 2FA on Gmail account
   - Generate App Password
   - Use App Password in .env (not main password)

3. **Secret Key**
   - Change `SECRET_KEY` in production
   - Use strong random string (32+ characters)
   - Example: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

4. **CORS Configuration**
   - In production, update `allow_origins` in main.py
   - Specify exact frontend domain
   - Only necessary for cross-origin requests

## 🧪 Testing

### Test Face Recognition
```python
# In Python REPL
from services import extract_face_encoding, compare_faces
# ... test with image files
```

### Test Encryption
```python
from services import encrypt_message, decrypt_message
key = "your_key_here"
msg = "Hello"
encrypted = encrypt_message(msg, key)
decrypted = decrypt_message(encrypted, key)
```

### Test Steganography
```python
from services import embed_message_in_image, extract_message_from_image
# ... test with image files
```

## 🤝 Contributing

Feel free to fork and submit PRs for improvements!

## 📄 License

This project is open source and available under the MIT License.

## 📧 Support

For issues or questions, please open an issue on the repository.

---

**Happy Secure Messaging!** 🔐✉️
