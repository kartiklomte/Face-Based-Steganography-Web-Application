"""
Main FastAPI application - Secure Face-Based Steganography Web App
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routes import auth_router, message_router

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Secure Steganography API",
    description="Face-based secure message steganography application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(message_router)

@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "Welcome to Secure Steganography API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("SERVER_HOST", "0.0.0.0")
    port = int(os.getenv("SERVER_PORT", "8000"))
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True
    )
