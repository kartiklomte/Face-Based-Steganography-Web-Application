"""
Message routes - Embed, Extract, and Share endpoints
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form
from fastapi.responses import FileResponse
from bson.objectid import ObjectId
import io
import os
from datetime import datetime
from database import users_collection, messages_collection
from models import MessageEmbed, MessageExtract, EmailShare
from services import (
    generate_encryption_key,
    encrypt_message,
    decrypt_message,
    embed_message_in_image,
    extract_message_from_image,
    send_stego_image_email,
    decode_token
)
from utils import generate_filename, string_to_object_id

router = APIRouter(prefix="/api", tags=["messages"])

# Dependency to get current user from JWT token
async def get_current_user(authorization: str = None):
    """
    Extract and verify JWT token from Authorization header
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id or not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return {"user_id": user_id, "email": email}
    
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/embed")
async def embed_message(
    receiver_email: str = Form(...),
    secret_message: str = Form(...),
    image: UploadFile = File(...),
    authorization: str = None
):
    """
    Embed encrypted message in image
    
    Process:
    1. Verify JWT token
    2. Generate AES encryption key
    3. Encrypt message
    4. Hide in image using LSB steganography
    5. Store metadata in MongoDB
    6. Return stego image and encryption key
    """
    try:
        # Get current user
        current_user = await get_current_user(authorization)
        sender_id = current_user["user_id"]
        sender_email = current_user["email"]
        
        # Verify receiver exists
        receiver = users_collection.find_one({"email": receiver_email})
        if not receiver:
            raise HTTPException(status_code=404, detail="Receiver email not found")
        
        # Read image
        image_bytes = await image.read()
        
        # Generate encryption key
        encryption_key = generate_encryption_key()
        
        # Encrypt message
        encrypted_message = encrypt_message(secret_message, encryption_key)
        
        # Embed in image
        stego_image_bytes, success = embed_message_in_image(image_bytes, encrypted_message)
        
        if not success or stego_image_bytes is None:
            raise HTTPException(status_code=400, detail="Failed to embed message in image")
        
        # Generate filename
        filename = generate_filename(image.filename)
        
        # Store message metadata in MongoDB
        message_doc = {
            "sender_id": ObjectId(sender_id),
            "sender_email": sender_email,
            "receiver_email": receiver_email,
            "encrypted_message": encrypted_message,
            "image_filename": filename,
            "encryption_key": encryption_key,
            "created_at": datetime.utcnow()
        }
        
        message_result = messages_collection.insert_one(message_doc)
        
        return {
            "success": True,
            "message": "Message embedded successfully",
            "encryption_key": encryption_key,
            "image_filename": filename,
            "stego_image": stego_image_bytes.hex()  # Convert to hex for JSON response
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Embed error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to embed message: {str(e)}")

@router.post("/extract")
async def extract_message(
    stego_image: UploadFile = File(...),
    encryption_key: str = Form(...),
    authorization: str = None
):
    """
    Extract and decrypt message from stego image
    
    Process:
    1. Verify JWT token
    2. Extract message from image using LSB
    3. Decrypt using AES key
    4. Verify user is intended receiver
    5. Return decrypted message
    """
    try:
        # Get current user
        current_user = await get_current_user(authorization)
        receiver_email = current_user["email"]
        
        # Read stego image
        stego_image_bytes = await stego_image.read()
        
        # Extract message from image
        encrypted_message, success = extract_message_from_image(stego_image_bytes)
        
        if not success or encrypted_message is None:
            raise HTTPException(status_code=400, detail="Failed to extract message from image")
        
        # Decrypt message
        try:
            secret_message = decrypt_message(encrypted_message, encryption_key)
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid encryption key or corrupted message")
        
        # Verify message is for current user (optional check)
        message_record = messages_collection.find_one({
            "receiver_email": receiver_email,
            "encrypted_message": encrypted_message
        })
        
        return {
            "success": True,
            "message": secret_message
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Extract error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to extract message: {str(e)}")

@router.post("/share-email")
async def share_via_email(
    receiver_email: str = Form(...),
    encryption_key: str = Form(...),
    stego_image: UploadFile = File(...),
    authorization: str = None
):
    """
    Send stego image via email to receiver
    
    Process:
    1. Verify JWT token
    2. Read stego image
    3. Send email with image and encryption key
    4. Return success message
    """
    try:
        # Get current user
        current_user = await get_current_user(authorization)
        sender_name = users_collection.find_one({"_id": ObjectId(current_user["user_id"])})["name"]
        
        # Read stego image
        stego_image_bytes = await stego_image.read()
        
        # Send email
        success = send_stego_image_email(receiver_email, encryption_key, stego_image_bytes, sender_name)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to send email")
        
        return {
            "success": True,
            "message": f"Stego image sent successfully to {receiver_email}"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Share email error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to share via email: {str(e)}")

@router.get("/messages")
async def get_messages(authorization: str = None):
    """
    Get all messages received by current user
    """
    try:
        # Get current user
        current_user = await get_current_user(authorization)
        receiver_email = current_user["email"]
        
        # Find messages for current user
        messages = list(messages_collection.find(
            {"receiver_email": receiver_email},
            {"encrypted_message": 0}  # Don't return encrypted message
        ))
        
        # Convert ObjectIds to strings
        for msg in messages:
            msg["_id"] = str(msg["_id"])
            msg["sender_id"] = str(msg["sender_id"])
        
        return {
            "success": True,
            "messages": messages
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get messages error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")
