"""
Database connection and configuration for MongoDB Atlas
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from urllib.parse import quote_plus, urlparse, urlunparse

# Load environment variables
load_dotenv()

# Get MongoDB URI - support both MONGODB_URI and MONGO_USER/MONGO_PASS formats
MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    # Try building from MONGO_USER and MONGO_PASS if MONGODB_URI not set
    mongo_user = os.getenv("MONGO_USER")
    mongo_pass = os.getenv("MONGO_PASS")
    
    if mongo_user and mongo_pass:
        username = quote_plus(mongo_user)
        password = quote_plus(mongo_pass)
        MONGODB_URI = f"mongodb+srv://{username}:{password}@steganography-cluster.kfkeuho.mongodb.net/?appName=steganography-cluster"
else:
    # If MONGODB_URI is provided, ensure special characters are properly encoded
    # Extract username and password from the URI and re-encode them
    try:
        parsed = urlparse(MONGODB_URI)
        if parsed.username and parsed.password:
            # Re-encode username and password to handle special characters
            safe_user = quote_plus(parsed.username)
            safe_pass = quote_plus(parsed.password)
            # Rebuild URL with properly encoded credentials
            netloc = f"{safe_user}:{safe_pass}@{parsed.hostname}"
            if parsed.port:
                netloc += f":{parsed.port}"
            MONGODB_URI = urlunparse((
                parsed.scheme,
                netloc,
                parsed.path,
                parsed.params,
                parsed.query,
                parsed.fragment
            ))
    except Exception as e:
        print(f"Warning: Could not re-encode MongoDB URI: {e}")

# Lazy initialization - only connect when needed
client = None
database = None
users_collection = None
messages_collection = None

def init_database():
    """Initialize database connection (called on first use)"""
    global client, database, users_collection, messages_collection
    
    if client is not None:
        return  # Already initialized
    
    if not MONGODB_URI:
        raise RuntimeError(
            "MongoDB connection failed. Set MONGODB_URI in .env file.\n"
            "Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"
        )
    
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        database = client["steganography_db"]
        
        # Collections
        users_collection = database["users"]
        messages_collection = database["messages"]
        
        # Create indexes for better performance
        users_collection.create_index("email", unique=True)
        messages_collection.create_index("sender_id")
        messages_collection.create_index("receiver_email")
        
        print("✓ MongoDB connected successfully")
    except Exception as e:
        print(f"✗ MongoDB connection error: {e}")
        raise

def get_users_collection():
    """Get users collection, initializing DB if needed"""
    global users_collection
    if users_collection is None:
        init_database()
    return users_collection

def get_messages_collection():
    """Get messages collection, initializing DB if needed"""
    global messages_collection
    if messages_collection is None:
        init_database()
    return messages_collection

def get_database():
    """Return database instance"""
    global database
    if database is None:
        init_database()
    return database

def close_database():
    """Close database connection"""
    global client, database, users_collection, messages_collection
    if client is not None:
        client.close()
        client = None
        database = None
        users_collection = None
        messages_collection = None

