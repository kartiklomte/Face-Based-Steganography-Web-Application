"""
Authentication routes - Register and Login endpoints
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from bson.objectid import ObjectId
from datetime import timedelta
from database import get_users_collection
from models import UserRegister, UserLogin, AuthResponse, UserResponse
from services import (
    hash_password, 
    verify_password, 
    create_access_token,
    extract_face_encoding,
    compare_faces
)
from utils import object_id_to_string

router = APIRouter(prefix="/api", tags=["auth"])

@router.post("/register", response_model=AuthResponse)
async def register(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    face_image: UploadFile = File(...)
):
    """
    Register a new user with face encoding
    
    Process:
    1. Check if email already exists
    2. Extract face encoding from image
    3. Hash password
    4. Store user in MongoDB
    5. Return JWT token
    """
    try:
        users_collection = get_users_collection()
        
        # Check if user already exists
        existing_user = users_collection.find_one({"email": email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Read image file
        image_bytes = await face_image.read()
        
        # Extract face encoding
        face_encoding = extract_face_encoding(image_bytes)
        if face_encoding is None:
            raise HTTPException(status_code=400, detail="No face detected in image. Please use a clear photo.")
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Create user document
        user_doc = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "face_encoding": face_encoding,
            "created_at": ""
        }
        
        # Insert user
        result = users_collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Create JWT token
        access_token = create_access_token(
            data={"sub": user_id, "email": email},
            expires_delta=timedelta(minutes=30)
        )
        
        user_response = UserResponse(
            id=user_id,
            name=name,
            email=email
        )
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Register error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=AuthResponse)
async def login(
    email: str = Form(...),
    password: str = Form(...),
    face_image: UploadFile = File(...)
):
    """
    Login user with email, password, and face verification
    
    Process:
    1. Verify email and password
    2. Extract face encoding from provided image
    3. Compare with stored face encoding
    4. Return JWT token if all checks pass
    """
    try:
        users_collection = get_users_collection()
        
        # Find user by email
        user = users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Read image file
        image_bytes = await face_image.read()
        
        # Extract face encoding from login image
        login_face_encoding = extract_face_encoding(image_bytes)
        if login_face_encoding is None:
            raise HTTPException(status_code=400, detail="No face detected in image")
        
        # Compare face encodings
        stored_face_encoding = user["face_encoding"]
        if not compare_faces(stored_face_encoding, login_face_encoding):
            raise HTTPException(status_code=401, detail="Face does not match. Access denied.")
        
        # Create JWT token
        user_id = str(user["_id"])
        access_token = create_access_token(
            data={"sub": user_id, "email": email},
            expires_delta=timedelta(minutes=30)
        )
        
        user_response = UserResponse(
            id=user_id,
            name=user["name"],
            email=email
        )
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
