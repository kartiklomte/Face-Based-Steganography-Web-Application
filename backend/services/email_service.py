"""
Email service for sending stego images via SMTP
"""
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email import encoders
import os
from dotenv import load_dotenv
import io

# Load environment variables
load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

def send_stego_image_email(receiver_email: str, encryption_key: str, image_bytes: bytes, sender_name: str) -> bool:
    """
    Send stego image via email with encryption key
    
    Args:
        receiver_email: Recipient email address
        encryption_key: Encryption key for decryption
        image_bytes: Stego image bytes
        sender_name: Name of the sender
        
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        # Create message
        message = MIMEMultipart()
        message["From"] = SENDER_EMAIL
        message["To"] = receiver_email
        message["Subject"] = f"Secure Message from {sender_name}"
        
        # Create email body
        body = f"""
Hello,

You have received a secure message from {sender_name}.

To decrypt the message:
1. Download the attached stego image
2. Go to the application and select "Extract Message"
3. Upload the image and use the encryption key below:

ENCRYPTION KEY:
{encryption_key}

Keep this key secure and confidential.

Best regards,
Secure Steganography Application
        """
        
        message.attach(MIMEText(body, "plain"))
        
        # Attach stego image
        image_part = MIMEBase("application", "octet-stream")
        image_part.set_payload(image_bytes)
        encoders.encode_base64(image_part)
        image_part.add_header("Content-Disposition", "attachment", filename="stego_image.png")
        message.attach(image_part)
        
        # Connect to SMTP server and send email
        session = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        session.starttls()
        session.login(SENDER_EMAIL, SENDER_PASSWORD)
        
        text = message.as_string()
        session.sendmail(SENDER_EMAIL, receiver_email, text)
        session.quit()
        
        return True
    
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False
