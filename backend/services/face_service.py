"""
Face recognition service using face_recognition library
"""
import face_recognition
import numpy as np
import io
from PIL import Image
from typing import Optional, List

FACE_RECOGNITION_THRESHOLD = 0.6

def extract_face_encoding(image_bytes: bytes) -> Optional[List[float]]:
    """
    Extract face encoding from image bytes
    
    Args:
        image_bytes: Image file bytes
        
    Returns:
        Face encoding as array of floats, or None if no face found
    """
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB mode (handles RGBA, grayscale, etc.)
        # This ensures the image is always 8-bit RGB
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert PIL Image to numpy array with uint8 dtype
        image_array = np.array(image, dtype=np.uint8)
        
        # Find face encodings in the image
        # face_recognition expects RGB format (which we now have)
        face_encodings = face_recognition.face_encodings(image_array)
        
        if len(face_encodings) == 0:
            return None
        
        # Return the first face encoding as list
        return face_encodings[0].tolist()
    
    except Exception as e:
        print(f"Error extracting face encoding: {str(e)}")
        return None

def compare_faces(encoding1: List[float], encoding2: List[float], threshold: float = FACE_RECOGNITION_THRESHOLD) -> bool:
    """
    Compare two face encodings to determine if they match
    
    Args:
        encoding1: First face encoding
        encoding2: Second face encoding
        threshold: Distance threshold (lower = more strict)
        
    Returns:
        True if faces match, False otherwise
    """
    try:
        # Convert to numpy arrays
        enc1 = np.array(encoding1)
        enc2 = np.array(encoding2)
        
        # Calculate face distance
        distance = face_recognition.face_distance([enc1], enc2)[0]
        
        # Return True if distance is below threshold
        return distance < threshold
    
    except Exception as e:
        print(f"Error comparing faces: {str(e)}")
        return False
