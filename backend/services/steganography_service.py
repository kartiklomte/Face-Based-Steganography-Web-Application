"""
LSB-based image steganography service
Hides encrypted messages in images using Least Significant Bit technique
"""
from PIL import Image
import io
import numpy as np
from typing import Tuple

def message_to_binary(message: str) -> str:
    """
    Convert message string to binary representation
    
    Args:
        message: Text message
        
    Returns:
        Binary string representation
    """
    return ''.join(format(ord(char), '08b') for char in message)

def binary_to_message(binary: str) -> str:
    """
    Convert binary representation back to message string
    
    Args:
        binary: Binary string
        
    Returns:
        Decoded message
    """
    # Split binary into 8-bit chunks and convert to characters
    chars = []
    for i in range(0, len(binary), 8):
        byte = binary[i:i+8]
        if len(byte) == 8:
            chars.append(chr(int(byte, 2)))
    return ''.join(chars)

def embed_message_in_image(image_bytes: bytes, secret_message: str) -> Tuple[bytes, bool]:
    """
    Embed encrypted message into image using LSB steganography
    
    Args:
        image_bytes: Original image bytes
        secret_message: Encrypted message to hide
        
    Returns:
        Tuple of (stego_image_bytes, success)
    """
    try:
        # Open image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert image to numpy array
        image_array = np.array(image, dtype=np.uint8)
        
        # Prepare message
        message_binary = message_to_binary(secret_message)
        message_length = len(message_binary)
        
        # Add message length header (32 bits for length)
        length_binary = format(message_length, '032b')
        full_message = length_binary + message_binary
        
        # Flatten the image array
        flat_image = image_array.flatten()
        
        # Check if message fits in the image
        if len(full_message) > len(flat_image):
            return None, False
        
        # Convert flat image to list for modification
        data = list(flat_image)
        
        # Embed message using LSB (Least Significant Bit)
        for i, bit in enumerate(full_message):
            # Clear the LSB and set it to message bit
            data[i] = (data[i] & 0xFE) | int(bit)
        
        # Reshape back to original dimensions
        stego_array = np.array(data, dtype=np.uint8).reshape(image_array.shape)
        
        # Convert back to image
        stego_image = Image.fromarray(stego_array, 'RGB')
        
        # Convert to bytes
        output = io.BytesIO()
        stego_image.save(output, format='PNG')
        output.seek(0)
        
        return output.getvalue(), True
    
    except Exception as e:
        print(f"Error embedding message: {str(e)}")
        return None, False

def extract_message_from_image(image_bytes: bytes) -> Tuple[str, bool]:
    """
    Extract encrypted message from stego image using LSB steganography
    
    Args:
        image_bytes: Stego image bytes
        
    Returns:
        Tuple of (extracted_message, success)
    """
    try:
        # Open image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert image to numpy array
        image_array = np.array(image, dtype=np.uint8)
        
        # Flatten the image array
        flat_image = image_array.flatten()
        
        # Extract message length (first 32 bits)
        length_binary = ''
        for i in range(32):
            length_binary += str(flat_image[i] & 1)
        
        message_length = int(length_binary, 2)
        
        # Extract message bits
        message_binary = ''
        for i in range(32, 32 + message_length):
            message_binary += str(flat_image[i] & 1)
        
        # Convert binary to message
        secret_message = binary_to_message(message_binary)
        
        return secret_message, True
    
    except Exception as e:
        print(f"Error extracting message: {str(e)}")
        return None, False
