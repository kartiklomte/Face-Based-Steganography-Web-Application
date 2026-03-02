"""
AES encryption and decryption service
"""
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

def generate_encryption_key() -> str:
    """
    Generate a secure random encryption key
    
    Returns:
        Base64 encoded encryption key as string
    """
    key = Fernet.generate_key()
    return key.decode('utf-8')

def encrypt_message(message: str, encryption_key: str) -> str:
    """
    Encrypt a message using AES encryption (Fernet)
    
    Args:
        message: Plain text message to encrypt
        encryption_key: Base64 encoded encryption key
        
    Returns:
        Base64 encoded encrypted message
    """
    try:
        key = encryption_key.encode() if isinstance(encryption_key, str) else encryption_key
        fernet = Fernet(key)
        encrypted_message = fernet.encrypt(message.encode('utf-8'))
        return encrypted_message.decode('utf-8')
    
    except Exception as e:
        print(f"Error encrypting message: {str(e)}")
        raise

def decrypt_message(encrypted_message: str, encryption_key: str) -> str:
    """
    Decrypt a message using AES decryption (Fernet)
    
    Args:
        encrypted_message: Base64 encoded encrypted message
        encryption_key: Base64 encoded encryption key
        
    Returns:
        Decrypted plain text message
    """
    try:
        key = encryption_key.encode() if isinstance(encryption_key, str) else encryption_key
        fernet = Fernet(key)
        decrypted_message = fernet.decrypt(encrypted_message.encode('utf-8'))
        return decrypted_message.decode('utf-8')
    
    except Exception as e:
        print(f"Error decrypting message: {str(e)}")
        raise
