"""
Utility functions for the application
"""
import os
from datetime import datetime
from bson.objectid import ObjectId

def generate_filename(original_filename: str) -> str:
    """
    Generate unique filename for stored images
    
    Args:
        original_filename: Original file name
        
    Returns:
        Unique filename with timestamp
    """
    timestamp = datetime.utcnow().timestamp()
    name, ext = os.path.splitext(original_filename)
    return f"{name}_{int(timestamp)}{ext}"

def object_id_to_string(obj_id) -> str:
    """
    Convert MongoDB ObjectId to string
    
    Args:
        obj_id: MongoDB ObjectId
        
    Returns:
        String representation
    """
    if isinstance(obj_id, ObjectId):
        return str(obj_id)
    return obj_id

def string_to_object_id(id_str: str):
    """
    Convert string to MongoDB ObjectId
    
    Args:
        id_str: String ID
        
    Returns:
        MongoDB ObjectId
    """
    try:
        return ObjectId(id_str)
    except:
        return None
