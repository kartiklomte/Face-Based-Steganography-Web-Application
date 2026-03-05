# Code Changes - Quick Reference

## All Changes at a Glance

### 1️⃣ Backend: Add Image Merge Function

**File:** `backend/services/steganography_service.py`

```python
# Line 1-8: Update imports
from PIL import Image
import io
import numpy as np
from typing import Tuple, Optional  # ← Added Optional

# Line 10-62: New function (add after imports)
def merge_images(image1_bytes: bytes, image2_bytes: bytes) -> Optional[bytes]:
    """
    Merge two images into a single cover image by placing them side-by-side horizontally.
    Images are resized to the same height before merging to ensure uniform dimensions.
    """
    try:
        img1 = Image.open(io.BytesIO(image1_bytes))
        img2 = Image.open(io.BytesIO(image2_bytes))
        
        if img1.mode != 'RGB':
            img1 = img1.convert('RGB')
        if img2.mode != 'RGB':
            img2 = img2.convert('RGB')
        
        width1, height1 = img1.size
        width2, height2 = img2.size
        
        target_height = max(height1, height2)
        ratio1 = target_height / height1
        ratio2 = target_height / height2
        
        new_width1 = int(width1 * ratio1)
        new_width2 = int(width2 * ratio2)
        
        img1_resized = img1.resize((new_width1, target_height), Image.LANCZOS)
        img2_resized = img2.resize((new_width2, target_height), Image.LANCZOS)
        
        merged_width = new_width1 + new_width2
        merged_image = Image.new('RGB', (merged_width, target_height))
        
        merged_image.paste(img1_resized, (0, 0))
        merged_image.paste(img2_resized, (new_width1, 0))
        
        output = io.BytesIO()
        merged_image.save(output, format='PNG')
        output.seek(0)
        
        return output.getvalue()
    
    except Exception as e:
        print(f"Error merging images: {str(e)}")
        return None
```

---

### 2️⃣ Backend: Update Message Routes

**File:** `backend/routes/message_routes.py`

```python
# Line 16: Add merge_images to imports
from services import (
    # ... existing imports ...
    merge_images  # ← ADD THIS
)

# Line 60-68: Update endpoint signature
@router.post("/embed")
async def embed_message(
    receiver_email: str = Form(...),
    secret_message: str = Form(...),
    image1: UploadFile = File(...),      # ← Changed from 'image'
    image2: UploadFile = File(...),      # ← Added
    current_user: dict = Depends(get_current_user)
):
    """
    Embed encrypted message in merged image (from two input images)
    
    Process:
    1. Verify JWT token
    2. Merge two input images into single cover image
    3. Generate AES encryption key
    4. Encrypt message
    5. Hide in merged image using LSB steganography
    6. Store metadata in MongoDB
    7. Return stego image and encryption key
    """
    try:
        # ... existing code ...
        
        # Line 95-105: Add merging step
        # Read both images
        image1_bytes = await image1.read()
        image2_bytes = await image2.read()
        
        # Merge images into single cover image
        merged_image_bytes = merge_images(image1_bytes, image2_bytes)
        if merged_image_bytes is None:
            raise HTTPException(status_code=400, detail="Failed to merge images")
        
        # Generate encryption key
        encryption_key = generate_encryption_key()
        
        # ... existing encryption code ...
        
        # Line 112-119: Update embed call to use merged image
        # Embed in merged image using LSB steganography
        stego_image_bytes, success = embed_message_in_image(
            merged_image_bytes,  # ← Use merged image
            encrypted_message
        )
        
        if not success or stego_image_bytes is None:
            raise HTTPException(status_code=400, detail="Failed to embed message in image")
        
        # Line 122: Update filename generation
        filename = generate_filename("stego_image.png")  # ← Use generic name
        
        # ... rest of function unchanged ...
```

---

### 3️⃣ Frontend: Update API Client

**File:** `frontend/src/utils/api.js`

```javascript
// Line 51-62: Update embedMessage function
export const embedMessage = async (receiverEmail, secretMessage, image1, image2) => {
  const formData = new FormData();
  formData.append('receiver_email', receiverEmail);
  formData.append('secret_message', secretMessage);
  formData.append('image1', image1);        // ← Add first image
  formData.append('image2', image2);        // ← Add second image

  const response = await apiClient.post('/api/embed', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
```

---

### 4️⃣ Frontend: Update Send Message Component

**File:** `frontend/src/pages/SendMessage.jsx`

```jsx
// Line 12-18: State variables
const [receiverEmail, setReceiverEmail] = useState('');
const [secretMessage, setSecretMessage] = useState('');
const [image1, setImage1] = useState(null);              // ← Add
const [image2, setImage2] = useState(null);              // ← Add
const [imagePreview1, setImagePreview1] = useState(null);// ← Add
const [imagePreview2, setImagePreview2] = useState(null);// ← Add
const [loading, setLoading] = useState(false);
// ... rest unchanged ...

// Line 24-42: Image handlers (add these two functions)
const handleImageChange1 = (e) => {
  const file = e.target.files[0];
  if (file) {
    setImage1(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview1(event.target.result);
    };
    reader.readAsDataURL(file);
  }
};

const handleImageChange2 = (e) => {
  const file = e.target.files[0];
  if (file) {
    setImage2(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview2(event.target.result);
    };
    reader.readAsDataURL(file);
  }
};

// Line 50-56: Update validation check
if (!receiverEmail || !secretMessage || !image1 || !image2) {
  setError('Please fill all fields including both images');  // ← Updated
  setLoading(false);
  return;
}

try {
  const response = await embedMessage(receiverEmail, secretMessage, image1, image2);
  // ... rest unchanged ...
}

// Line 195-211: Update form JSX (replace single image section with two)
<div>
  <label className="block text-gray-300 mb-2">Select First Image</label>
  {imagePreview1 && (
    <img src={imagePreview1} alt="Preview 1" className="w-full rounded-lg mb-4 max-h-64" />
  )}
  <input
    type="file"
    accept="image/*"
    onChange={handleImageChange1}
    className="w-full bg-gray-700 text-white p-2 rounded-lg"
  />
  <p className="text-gray-400 text-xs mt-1">Supported formats: PNG, JPG, BMP, etc.</p>
</div>

<div>
  <label className="block text-gray-300 mb-2">Select Second Image</label>
  {imagePreview2 && (
    <img src={imagePreview2} alt="Preview 2" className="w-full rounded-lg mb-4 max-h-64" />
  )}
  <input
    type="file"
    accept="image/*"
    onChange={handleImageChange2}
    className="w-full bg-gray-700 text-white p-2 rounded-lg"
  />
  <p className="text-gray-400 text-xs mt-1">Images will be merged horizontally, resized to same height</p>
</div>

// Line 220: Update button text
{loading ? 'Embedding Message...' : '🔒 Embed Message in Merged Images'}

// Line 231-242: Update reset button
<button
  onClick={() => {
    setSuccess(false);
    setEmbeddedData(null);
    setReceiverEmail('');
    setSecretMessage('');
    setImage1(null);       // ← Update
    setImage2(null);       // ← Update
    setImagePreview1(null);// ← Update
    setImagePreview2(null);// ← Update
  }}
  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold"
>
  Send Another Message
</button>
```

---

### 5️⃣ Documentation: Update README

**File:** `README.md`

```markdown
# Features Section (Line ~22)
- **🖼️ Dual-Image Steganography**: Merge two images into a single cover image before hiding encrypted messages
- **🖼️ LSB Steganography**: Hide encrypted messages in merged images using Least Significant Bit technique

# Message Security Section (Line ~107)
1. **Image Merging**: Two input images merged side-by-side into single cover image
2. **Encryption**: Message encrypted with AES using Fernet
3. **Steganography**: Encrypted message hidden in merged image using LSB
4. **Key Management**: Unique AES key generated for each message
5. **Access Control**: Only intended receiver can extract with proper key

# API Endpoints (Line ~161)
- `POST /api/embed` - Embed encrypted message in merged images (2 input images)

# Usage Example (Line ~174)
2. **Send Message**
   - Fill in receiver email
   - Write your secret message
   - Select TWO images to merge and embed in
   - Images will be resized to same height and merged horizontally
   - Click "Embed Message in Merged Images"

# Steganography Details (Line ~261)
- **Image Merging**: Two input images merged side-by-side horizontally
- **Height Alignment**: Images resized to same height (maintaining aspect ratio before merging)
- **Method**: LSB (Least Significant Bit)
- **Capacity**: Depends on merged image dimensions (larger capacity due to two images)
- **Format**: PNG for lossless storage
- **Header**: 32-bit message length prefix

# Steganography Service (Line ~272)
- **merge_images()**: Merges two input images side-by-side horizontally
  - Resizes images to same height
  - Maintains aspect ratio before merging
  - Converts to RGB and outputs as PNG
- **message_to_binary()**: Converts messages to binary
- ... (rest of functions documented)

# Workflow Diagram (Line ~299)
Send Message
    ↓
[Select two images] → [Merge horizontally] → [Resize to same height] → [Message] → [Generate AES key] → [Encrypt] → [Hide in merged image via LSB]
```

---

## Summary of Changes

| File | Type | Change |
|------|------|--------|
| `steganography_service.py` | Python | Add `merge_images()` function (62 lines) |
| `message_routes.py` | Python | Update `/embed` endpoint (image1, image2, merge call) |
| `api.js` | JavaScript | Update `embedMessage()` to send 2 images |
| `SendMessage.jsx` | React | Dual image inputs, handlers, validation |
| `README.md` | Markdown | Update features, workflow, documentation |

---

## Testing the Changes

### Step 1: Verify Backend
```bash
cd backend
python -c "from services import merge_images; print('✓ merge_images imported successfully')"
```

### Step 2: Test Merge Function
```python
# In Python REPL or test file
from services import merge_images

with open('test1.jpg', 'rb') as f:
    img1 = f.read()
with open('test2.png', 'rb') as f:
    img2 = f.read()

result = merge_images(img1, img2)
assert result is not None, "Merge failed"
print("✓ Merge successful")
```

### Step 3: Test Frontend
1. Start backend: `python main.py`
2. Start frontend: `npm run dev`
3. Go to: `http://localhost:5173/send-message`
4. Upload two test images
5. Verify both previews display
6. Send message
7. Verify success screen

### Step 4: Test Extraction
1. Login as receiver account
2. Go to: `http://localhost:5173/receive-message`
3. Upload stego image
4. Paste encryption key
5. Verify message extracted correctly

---

## No Changes Required To:

✅ `encryption_service.py` - Encryption/decryption unchanged  
✅ `extract_message_from_image()` - Extraction algorithm unchanged  
✅ `/extract` endpoint - Extraction endpoint unchanged  
✅ `/login` endpoint - Authentication unchanged  
✅ Face recognition logic - Facial verification unchanged  

---
