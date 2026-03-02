# 🏗️ System Architecture & Component Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT BROWSER (React + Vite)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐          │
│  │   Home.jsx   │  │ Dashboard    │  │  Send/Receive │          │
│  │  (Landing)   │  │  (Hub)       │  │    (Core)     │          │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘          │
│         │                 │                  │                  │
│  ┌───────────────────────────────────────────────────┐          │
│  │  Register.jsx    Login.jsx                        │          │
│  │  (Face Capture)  (Face Verify)                    │          │
│  └────────┬──────────────────────────┬───────────────┘          │
│           │                          │                          │
│  ┌────────┴──────────────────────────┴────────┐                 │
│  │           PrivateRoute.jsx                 │                 │
│  │      (Auth Guard)                          │                 │
│  └──────────────────┬─────────────────────────┘                 │
│                     │                                           │
│  ┌──────────────────▼─────────────────┐                         │
│  │    Header.jsx   WebcamCapture.jsx  │                         │
│  │    (Nav)        (Face Camera)      │                         │
│  └──────────────────┬─────────────────┘                         │
│                     │                                           │
│  ┌──────────────────▼──────────────────────┐                    │
│  │         API Client (utils/api.js)       │                    │
│  │  - registerUser()                       │                    │
│  │  - loginUser()                          │                    │
│  │  - embedMessage()                       │                    │
│  │  - extractMessage()                     │                    │
│  │  - shareViaEmail()                      │                    │
│  │  - getMessages()                        │                    │
│  └──────────────────┬──────────────────────┘                    │
│                     │                                           │
│  ┌──────────────────▼──────────────────────┐                    │
│  │     Auth Utils (utils/auth.js)          │                    │
│  │  - setAuthToken()                       │                    │
│  │  - getUser()                            │                    │
│  │  - isAuthenticated()                    │                    │
│  │  - downloadFile()                       │                    │
│  │  - hexToBlob()                          │                    │
│  └──────────────────┬──────────────────────┘                    │
│                     │                                           │
│                     │ HTTP/HTTPS (Axios)                        │
│                     │ + JWT Token                               │
└─────────────────────┼───────────────────────────────────────────┘
                      │
                      │ API GATEWAY
                      │
┌─────────────────────▼────────────────────────────────────────┐
│              FASTAPI BACKEND SERVER                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────┐                  │
│  │   main.py                              │                  │
│  │   (FastAPI Application)                │                  │
│  │   - CORS Middleware                    │                  │
│  │   - Route Registration                 │                  │
│  └────────┬─────────────────────────┬─────┘                  │
│           │                         │                        │
│  ┌────────▼────────┐    ┌──────────▼──────────┐              │
│  │ auth_routes.py  │    │ message_routes.py   │              │
│  │                 │    │                     │              │
│  │ POST /register  │    │ POST /embed         │              │
│  │ POST /login     │    │ POST /extract       │              │
│  │                 │    │ POST /share-email   │              │
│  │                 │    │ GET /messages       │              │
│  └────────┬────────┘    └──────────┬──────────┘              │
│           │                        │                         │
│  ┌────────┴────────────────────────┴──────────┐              │
│  │           Dependencies / JWT Middleware    │              │
│  │  - Authorization header validation         │              │
│  │  - Token decoding                          │              │
│  │  - User context extraction                 │              │
│  └────────┬─────────────────────────────────┬─┘              │
│           │                                 │                │
│  ┌────────▼────────┐      ┌────────────────▼────────┐        │
│  │ auth_service.py │      │ encryption_service.py   │        │
│  │                 │      │                         │        │
│  │ hash_password() │      │ encrypt_message()       │        │
│  │ verify_password() │      │ decrypt_message()     │        │
│  │ create_token()  │      │ generate_key()          │        │
│  │ decode_token()  │      │                         │        │
│  └────────┬────────┘      └────────────────┬────────┘        │
│           │                                │                 │
│  ┌────────▼────────┐      ┌────────────────▼────────┐        │
│  │ face_service.py │      │steganography_service.py │        │
│  │                 │      │                         │        │
│  │ extract_encoding() │      │ embed_message()      │        │
│  │ compare_faces()   │      │ extract_message()     │        │
│  │                 │      │ message_to_binary()     │        │
│  │                 │      │ binary_to_message()     │        │
│  └────────┬────────┘      └────────────────┬────────┘        │
│           │                                │                 │
│  ┌────────▼────────────────────────────────▼───────┐         │
│  │         email_service.py                        │         │
│  │                                                 │         │
│  │ send_stego_image_email()                        │         │
│  │ (Sends via SMTP)                                │         │
│  └────────┬────────────────────────────────────────┘         │
│           │                                                  │
│  ┌────────▼──────────────────────────────────┐               │
│  │      database.py                          │               │
│  │      (MongoDB Connection)                 │               │
│  │  - users_collection                       │               │
│  │  - messages_collection                    │               │
│  │  - Create indexes                         │               │
│  │  - Connection pooling                     │               │
│  └────────┬─────────────────────────────────┘                │
│           │                                                  │
│  ┌────────▼─────────────────────────────────┐                │
│  │      helpers.py                          │                │
│  │      - generate_filename()                │               │
│  │      - object_id_conversion()             │               │
│  └──────────────────────────────────────────┘                │
└────────────┬─────────────────────────────────────────────────┘
             │
             │ Network Request (HTTP/HTTPS)
             │ MongoDB Driver (PyMongo)
             │ SMTP (Email)
             │
┌────────────▼─────────────────────────────────────────────┐
│         EXTERNAL SERVICES                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────┐  ┌──────────────────────┐        │
│  │  MongoDB Atlas     │  │  Gmail SMTP Server   │        │
│  │  (Database)        │  │  (Email Service)     │        │
│  │  - users table     │  │  - TLS encryption    │        │
│  │  - messages table  │  │  - Authentication    │        │
│  │  - Connection      │  │                      │        │
│  │    pooling         │  │                      │        │
│  └────────────────────┘  └──────────────────────┘        │
│                                                          │
│  ┌────────────────────┐  ┌──────────────────────┐        │
│  │  dlib (via         │  │  cryptography        │        │
│  │  face_recognition) │  │  (Fernet/AES)        │        │
│  │  - Face encoding   │  │  - Encryption        │        │
│  │  - Face comparison │  │  - Key generation    │        │
│  └────────────────────┘  └──────────────────────┘        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Data Flow for Key Operations

### 1️⃣ Registration Flow
```
┌─────────────────────────────────────────────────────────┐
│  User fills form + captures face from webcam            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Frontend: registerUser(name, email, password, image)   │
│  → Sends FormData with face image                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Backend: POST /api/register                            │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴────────────┐
         │                        │
         ▼                        ▼
    ┌─────────────┐      ┌──────────────────────┐
    │ Face detect │      │ Check email exists   │
    │ + encode    │      │ in MongoDB           │
    └─────┬───────┘      └──────────┬───────────┘
          │                         │
          └────────────┬────────────┘
                       │
                       ▼
         ┌──────────────────────────────┐
         │ Hash password with bcrypt    │
         └────────────┬─────────────────┘
                      │
                      ▼
         ┌──────────────────────────────┐
         │ Store user in MongoDB:       │
         │ - name                       │
         │ - email (unique)             │
         │ - password_hash              │
         │ - face_encoding []           │
         └────────────┬─────────────────┘
                      │
                      ▼
         ┌──────────────────────────────┐
         │ Create JWT token             │
         │ Include: user_id, email      │
         └────────────┬─────────────────┘
                      │
                      ▼
         ┌──────────────────────────────┐
         │ Return token to frontend     │
         │ Store in localStorage        │
         │ Redirect to Dashboard        │
         └──────────────────────────────┘
```

### 2️⃣ Send Message Flow
```
┌──────────────────────────────────────────────────────────┐
│  User enters: receiver email, message, image             │
│  Frontend has JWT token from login                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  Frontend: embedMessage(receiver, message, image)        │
│  → Attach JWT in Authorization header                    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  Backend: POST /api/embed                                │
│  → JWT validated by middleware                           │
└────────────────────┬─────────────────────────────────────┘
                     │
         ┌───────────┴───────────┬─────────────┐
         │                       │             │
         ▼                       ▼             ▼
    ┌─────────────┐      ┌────────────┐  ┌──────────────┐
    │ Verify      │      │ Generate   │  │ Check        │
    │ receiver    │      │ random AES │  │ receiver     │
    │ exists      │      │ key        │  │ exists       │
    └────────┬────┘      └────────┬───┘  └────────┬─────┘
             │                    │               │
             └────────────┬───────┴───────────────┘
                          │
                          ▼
            ┌─────────────────────────────────┐
            │ Encrypt message with AES key    │
            │ Using cryptography.Fernet       │
            └─────────────┬───────────────────┘
                          │
                          ▼
            ┌─────────────────────────────────┐
            │ Hide encrypted message in image │
            │ Using LSB steganography         │
            │ - Convert message to binary     │
            │ - Embed in LSB of pixels        │
            │ - Generate new PNG              │
            └─────────────┬───────────────────┘
                          │
                          ▼
            ┌─────────────────────────────────┐
            │ Store in MongoDB:               │
            │ - sender_id                     │
            │ - receiver_email                │
            │ - encrypted_message             │
            │ - encryption_key                │
            │ - image_filename                │
            │ - created_at                    │
            └─────────────┬───────────────────┘
                          │
                          ▼
            ┌─────────────────────────────────┐
            │ Return to frontend:             │
            │ - stego_image (hex encoded)     │
            │ - encryption_key (plain text)   │
            │ - success message               │
            └─────────────┬───────────────────┘
                          │
                          ▼
            ┌─────────────────────────────────┐
            │ Frontend shows:                 │
            │ - Encryption key (copy button)  │
            │ - Download stego image          │
            │ - Share via email button        │
            └─────────────────────────────────┘
```

### 3️⃣ Receive & Extract Message Flow
```
┌──────────────────────────────────────────────────────────┐
│  User uploads stego image + provides encryption key      │
│  Frontend has JWT token from login                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  Frontend: extractMessage(stegoImage, encryptionKey)     │
│  → Attach JWT in Authorization header                    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  Backend: POST /api/extract                              │
│  → JWT validated by middleware                           │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
            ┌──────────────────────────────┐
            │ Read stego image             │
            │ Convert to numpy array       │
            └──────────┬───────────────────┘
                       │
                       ▼
            ┌──────────────────────────────┐
            │ Extract from LSB:            │
            │ - Read LSB of each pixel     │
            │ - Reconstruct binary string  │
            │ - Convert binary to message  │
            └──────────┬───────────────────┘
                       │
                       ▼
            ┌──────────────────────────────┐
            │ Decrypt with provided key:   │
            │ - Use Fernet with key        │
            │ - Validate authenticity      │
            │ - Return plain text message  │
            └──────────┬───────────────────┘
                       │
                       ▼
            ┌──────────────────────────────┐
            │ Return to frontend:          │
            │ - Decrypted message          │
            │ - success indicator          │
            └──────────┬───────────────────┘
                       │
                       ▼
            ┌──────────────────────────────┐
            │ Frontend displays:           │
            │ - Secret message             │
            │ - Copy to clipboard button   │
            └──────────────────────────────┘
```

## Component Hierarchy

```
App.jsx (Router)
│
├── Home
│   └── Header
│
├── Register
│   ├── Header
│   └── WebcamCapture
│
├── Login
│   ├── Header
│   └── WebcamCapture
│
├── PrivateRoute (Guard)
│   │
│   ├── Dashboard
│   │   └── Header
│   │
│   ├── SendMessage
│   │   └── Header
│   │
│   └── ReceiveMessage
│       └── Header
```

## Service Dependencies

```
main.py
│
├── auth_routes
│   ├── face_service
│   ├── auth_service
│   └── database
│
├── message_routes
│   ├── encryption_service
│   ├── steganography_service
│   ├── email_service
│   ├── face_service
│   ├── auth_service
│   └── database
│
└── CORS middleware
```

## Technology Stack Map

```
FRONTEND                          BACKEND                     DATABASE
┌──────────────────────┐         ┌──────────────────────┐    ┌─────────┐
│ React 18             │────────→│ FastAPI              │───→│ MongoDB │
│ Vite (Dev/Build)     │         │ (Python Framework)   │    │ Atlas   │
│ React Router v6      │         │                      │    │ (Cloud) │
│ Axios (HTTP)         │         │ PyMongo (Driver)     │    └─────────┘
│ Tailwind CSS         │         │ Pydantic (Validation)│
│ react-webcam        │         │                      │
└──────────────────────┘         └──────────────────────┘

SECURITY LAYERS
┌─────────────────────────────────────────────────────────┐
│ JWT Authentication (Token-based, HS256)                │
│ Bcrypt Password Hashing (Cost: 4.1.1)                  │
│ AES-128-CBC Encryption (Fernet)                        │
│ LSB Steganography (Image hiding)                       │
│ Face Recognition (dlib-based, 128-D encodings)         │
│ HTTPS/TLS (For production)                             │
└─────────────────────────────────────────────────────────┘

EXTERNAL LIBRARIES
┌──────────────────┐  ┌──────────────┐  ┌───────────────┐
│ face_recognition │  │ cryptography │  │ opencv-python│
│ (Face encoding)  │  │ (AES/Fernet) │  │ (Image I/O)  │
└──────────────────┘  └──────────────┘  └───────────────┘
```

## Authentication Flow Timeline

```
Time  Frontend                  Backend                  Database
────────────────────────────────────────────────────────────────
T0    User registers
      (name, email, pwd, face)
      │
T1    Send to /register ──────→ POST /register
      │                        │
T2                            Extract face encoding
      │                        │
T3                            Hash password
      │            Create user document
T4                            │
      │                   Insert to MongoDB ────→ Store user
      │                        │                  (face_encoding[])
T5                            │ Return JWT token ←──
      │ ←────── JWT + User data
      │
T6    Store JWT in localStorage
      (Valid for 30 minutes)
      │
T7    Next request: Add "Authorization: Bearer JWT"
      │                        │
T8                        JWT middleware
                          Decode & validate
                          Extract user_id, email
      │ ←────── ✓ Allowed (protected endpoints)
```

This architecture ensures:
- ✅ Separation of concerns
- ✅ Scalability
- ✅ Security
- ✅ Maintainability
- ✅ Testability
