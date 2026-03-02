"""
Database connection and configuration for MongoDB Atlas
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection string from environment
MONGODB_URI = os.getenv("MONGODB_URI")

# Create MongoDB client
client = MongoClient(MONGODB_URI)
database = client["steganography_db"]

# Collections
users_collection = database["users"]
messages_collection = database["messages"]

# Create indexes for better performance
users_collection.create_index("email", unique=True)
messages_collection.create_index("sender_id")
messages_collection.create_index("receiver_email")

def get_database():
    """Return database instance"""
    return database

def close_database():
    """Close database connection"""
    client.close()
