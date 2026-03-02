"""
Database connection and configuration for MongoDB Atlas
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from urllib.parse import quote_plus

# Load environment variables
load_dotenv()

username = quote_plus(os.getenv("MONGO_USER"))
password = quote_plus(os.getenv("MONGO_PASS"))

# MongoDB connection string from environment
MONGODB_URI = f"mongodb+srv://{username}:{password}@steganography-cluster.kfkeuho.mongodb.net/?appName=steganography-cluster"

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
