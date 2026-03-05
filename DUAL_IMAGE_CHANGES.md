# Dual Image Support Implementation - Code Changes

## Summary
This document outlines all code changes made to support TWO input images instead of one. The two images are merged into a single cover image before being passed to the existing steganography encoding function.

### Important Constraints Met
✅ **Encryption logic**: NOT modified  
✅ **Steganography algorithm**: NOT modified  
✅ **Decoding logic**: NOT modified  
✅ **Only preprocessing step**: Image merging added  

---

## 1. Backend Changes

### File: `backend/services/steganography_service.py`

#### Change 1.1: Import Statement
**Added `Optional` type hint:**
```python
# BEFORE
from typing import Tuple

# AFTER
from typing import Tuple, Optional
```

#### Change 1.2: New Function - `merge_images()`
**Added new preprocessing function to merge two images:**
```python
def merge_images(image1_bytes: bytes, image2_bytes: bytes) -> Optional[bytes]:
    """
    Merge two images into a single cover image by placing them side-by-side horizontally.
    Images are resized to the same height before merging to ensure uniform dimensions.
    
    Args:
        image1_bytes: First image bytes
        image2_bytes: Second image bytes
        
    Returns:
        Merged image bytes or None if merge fails
    """
    try:
        # Open both images
        img1 = Image.open(io.BytesIO(image1_bytes))
        img2 = Image.open(io.BytesIO(image2_bytes))
        
        # Convert to RGB if necessary
        if img1.mode != 'RGB':
            img1 = img1.convert('RGB')
        if img2.mode != 'RGB':
            img2 = img2.convert('RGB')
        
        # Get dimensions
        width1, height1 = img1.size
        width2, height2 = img2.size
        
        # Use the maximum height as target height
        target_height = max(height1, height2)
        
        # Resize images to the same height while maintaining aspect ratio
        ratio1 = target_height / height1
        ratio2 = target_height / height2
        
        new_width1 = int(width1 * ratio1)
        new_width2 = int(width2 * ratio2)
        
        img1_resized = img1.resize((new_width1, target_height), Image.LANCZOS)
        img2_resized = img2.resize((new_width2, target_height), Image.LANCZOS)
        
        # Create merged image (side-by-side horizontally)
        merged_width = new_width1 + new_width2
        merged_image = Image.new('RGB', (merged_width, target_height))
        
        # Paste images
        merged_image.paste(img1_resized, (0, 0))
        merged_image.paste(img2_resized, (new_width1, 0))
        
        # Convert to bytes
        output = io.BytesIO()
        merged_image.save(output, format='PNG')
        output.seek(0)
        
        return output.getvalue()
    
    except Exception as e:
        print(f"Error merging images: {str(e)}")
        return None
```

**Location:** Added before `message_to_binary()` function  
**Purpose:** Merges two input images into single cover image with:
- Horizontal placement (side-by-side)
- Height normalization (both images resized to max height)
- Aspect ratio preservation
- RGB color mode conversion
- PNG format output

---

### File: `backend/routes/message_routes.py`

#### Change 2.1: Import Statement
**Added `merge_images` to imports:**
```python
# BEFORE
from services import (
    generate_encryption_key,
    encrypt_message,
    decrypt_message,
    embed_message_in_image,
    extract_message_from_image,
    send_stego_image_email,
    decode_token
)

# AFTER
from services import (
    generate_encryption_key,
    encrypt_message,
    decrypt_message,
    embed_message_in_image,
    extract_message_from_image,
    send_stego_image_email,
    decode_token,
    merge_images
)
```

#### Change 2.2: `/embed` Endpoint Function Signature
**Updated to accept two images:**
```python
# BEFORE
@router.post("/embed")
async def embed_message(
    receiver_email: str = Form(...),
    secret_message: str = Form(...),
    image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):

# AFTER
@router.post("/embed")
async def embed_message(
    receiver_email: str = Form(...),
    secret_message: str = Form(...),
    image1: UploadFile = File(...),
    image2: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
```

#### Change 2.3: Updated Docstring
**Updated endpoint documentation:**
```python
# BEFORE
    """
    Embed encrypted message in image
    
    Process:
    1. Verify JWT token
    2. Generate AES encryption key
    3. Encrypt message
    4. Hide in image using LSB steganography
    5. Store metadata in MongoDB
    6. Return stego image and encryption key
    """

# AFTER
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
```

#### Change 2.4: Image Reading & Merging
**Added preprocessing step:**
```python
# BEFORE
        # Read image
        image_bytes = await image.read()

# AFTER
        # Read both images
        image1_bytes = await image1.read()
        image2_bytes = await image2.read()
        
        # Merge images into single cover image
        merged_image_bytes = merge_images(image1_bytes, image2_bytes)
        if merged_image_bytes is None:
            raise HTTPException(status_code=400, detail="Failed to merge images")
```

#### Change 2.5: Embedding Call
**Updated to use merged image:**
```python
# BEFORE
        # Embed in image
        stego_image_bytes, success = embed_message_in_image(image_bytes, encrypted_message)
        
        if not success or stego_image_bytes is None:
            raise HTTPException(status_code=400, detail="Failed to embed message in image")
        
        # Generate filename
        filename = generate_filename(image.filename)

# AFTER
        # Embed in merged image using LSB steganography
        stego_image_bytes, success = embed_message_in_image(merged_image_bytes, encrypted_message)
        
        if not success or stego_image_bytes is None:
            raise HTTPException(status_code=400, detail="Failed to embed message in image")
        
        # Generate filename from merged image
        filename = generate_filename("stego_image.png")
```

---

## 2. Frontend Changes

### File: `frontend/src/utils/api.js`

#### Change 3.1: embedMessage Function
**Updated API function to send two images:**
```javascript
// BEFORE
export const embedMessage = async (receiverEmail, secretMessage, image) => {
  const formData = new FormData();
  formData.append('receiver_email', receiverEmail);
  formData.append('secret_message', secretMessage);
  formData.append('image', image);

  const response = await apiClient.post('/api/embed', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// AFTER
export const embedMessage = async (receiverEmail, secretMessage, image1, image2) => {
  const formData = new FormData();
  formData.append('receiver_email', receiverEmail);
  formData.append('secret_message', secretMessage);
  formData.append('image1', image1);
  formData.append('image2', image2);

  const response = await apiClient.post('/api/embed', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
```

---

### File: `frontend/src/pages/SendMessage.jsx`

#### Change 4.1: State Variables
**Updated state to track two images:**
```javascript
// BEFORE
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

// AFTER
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [imagePreview1, setImagePreview1] = useState(null);
  const [imagePreview2, setImagePreview2] = useState(null);
```

#### Change 4.2: Image Change Handlers
**Added separate handler for each image:**
```javascript
// BEFORE
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

// AFTER
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
```

#### Change 4.3: Validation & API Call
**Updated to require both images:**
```javascript
// BEFORE
    if (!receiverEmail || !secretMessage || !image) {
      setError('Please fill all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await embedMessage(receiverEmail, secretMessage, image);

// AFTER
    if (!receiverEmail || !secretMessage || !image1 || !image2) {
      setError('Please fill all fields including both images');
      setLoading(false);
      return;
    }

    try {
      const response = await embedMessage(receiverEmail, secretMessage, image1, image2);
```

#### Change 4.4: Form JSX - Image Inputs
**Added two separate image input sections:**
```jsx
// BEFORE
                <div>
                  <label className="block text-gray-300 mb-2">Select Image</label>
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-full rounded-lg mb-4 max-h-64" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-gray-700 text-white p-2 rounded-lg"
                  />
                  <p className="text-gray-400 text-xs mt-1">Supported formats: PNG, JPG, BMP, etc.</p>
                </div>

// AFTER
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
```

#### Change 4.5: Submit Button Text
**Updated button label:**
```jsx
// BEFORE
                  {loading ? 'Embedding Message...' : '🔒 Embed Message in Image'}

// AFTER
                  {loading ? 'Embedding Message...' : '🔒 Embed Message in Merged Images'}
```

#### Change 4.6: Reset Button
**Updated to reset both images:**
```javascript
// BEFORE
                    onClick={() => {
                      setSuccess(false);
                      setEmbeddedData(null);
                      setReceiverEmail('');
                      setSecretMessage('');
                      setImage(null);
                      setImagePreview(null);
                    }}

// AFTER
                    onClick={() => {
                      setSuccess(false);
                      setEmbeddedData(null);
                      setReceiverEmail('');
                      setSecretMessage('');
                      setImage1(null);
                      setImage2(null);
                      setImagePreview1(null);
                      setImagePreview2(null);
                    }}
```

---

## 3. Documentation Changes

### File: `README.md`

#### Change 5.1: Features Section
**Added dual-image feature:**
```markdown
# BEFORE
- **🖼️ LSB Steganography**: Hide encrypted messages in images using Least Significant Bit technique

# AFTER
- **🖼️ Dual-Image Steganography**: Merge two images into a single cover image before hiding encrypted messages
- **🖼️ LSB Steganography**: Hide encrypted messages in merged images using Least Significant Bit technique
```

#### Change 5.2: Message Security
**Updated workflow description:**
```markdown
# BEFORE
### Message Security
1. **Encryption**: Message encrypted with AES using Fernet
2. **Steganography**: Encrypted message hidden in image using LSB
3. **Key Management**: Unique AES key generated for each message
4. **Access Control**: Only intended receiver can extract with proper key

# AFTER
### Message Security
1. **Image Merging**: Two input images merged side-by-side into single cover image
2. **Encryption**: Message encrypted with AES using Fernet
3. **Steganography**: Encrypted message hidden in merged image using LSB
4. **Key Management**: Unique AES key generated for each message
5. **Access Control**: Only intended receiver can extract with proper key
```

#### Change 5.3: API Endpoints
**Updated endpoint description:**
```markdown
# BEFORE
- `POST /api/embed` - Embed encrypted message in image

# AFTER
- `POST /api/embed` - Embed encrypted message in merged images (2 input images)
```

#### Change 5.4: Usage Example
**Updated user workflow:**
```markdown
# BEFORE
2. **Send Message**
   - Fill in receiver email
   - Write your secret message
   - Select an image to embed in
   - Click "Embed Message"

# AFTER
2. **Send Message**
   - Fill in receiver email
   - Write your secret message
   - Select TWO images to merge and embed in
   - Images will be resized to same height and merged horizontally
   - Click "Embed Message in Merged Images"
```

#### Change 5.5: Steganography Section
**Enhanced technical details:**
```markdown
# BEFORE
### Steganography
- Method: LSB (Least Significant Bit)
- Capacity: Depends on image dimensions
- Format: PNG for lossless storage
- Header: 32-bit message length prefix

# AFTER
### Steganography
- **Image Merging**: Two input images merged side-by-side horizontally
- **Height Alignment**: Images resized to same height (maintaining aspect ratio before merging)
- **Method**: LSB (Least Significant Bit)
- **Capacity**: Depends on merged image dimensions (larger capacity due to two images)
- **Format**: PNG for lossless storage
- **Header**: 32-bit message length prefix
```

#### Change 5.6: Steganography Service Section
**Added method documentation:**
```markdown
# BEFORE
### Steganography Service (`steganography_service.py`)
- Converts messages to binary
- Embeds in LSB of pixel values
- Extracts bit-by-bit from image
- Length-prefixed for recovery

# AFTER
### Steganography Service (`steganography_service.py`)
- **merge_images()**: Merges two input images side-by-side horizontally
  - Resizes images to same height
  - Maintains aspect ratio before merging
  - Converts to RGB and outputs as PNG
- **message_to_binary()**: Converts messages to binary
- **embed_message_in_image()**: Embeds binary in LSB of pixel values
- **extract_message_from_image()**: Extracts bit-by-bit from image
- Length-prefixed for message recovery
```

#### Change 5.7: Workflow Diagram
**Updated process flow:**
```
# BEFORE
Send Message
    ↓
[Select image] → [Message] → [Generate AES key] → [Encrypt] → [Hide in image via LSB]

# AFTER
Send Message
    ↓
[Select two images] → [Merge horizontally] → [Resize to same height] → [Message] → [Generate AES key] → [Encrypt] → [Hide in merged image via LSB]
```

---

## Summary Table

| Component | Change Type | Details |
|-----------|------------|---------|
| `steganography_service.py` | New Function | `merge_images()` - Merges two images horizontally |
| `message_routes.py` | Endpoint Modification | `/embed` now accepts `image1` and `image2` |
| `api.js` | Function Update | `embedMessage()` sends two images |
| `SendMessage.jsx` | UI Component | Shows two image inputs with separate previews |
| `README.md` | Documentation | Updated all references to dual-image workflow |

---

## Testing the Changes

### Backend Test
```bash
# The /embed endpoint now expects:
POST /api/embed
Content-Type: multipart/form-data

receiver_email: "user@example.com"
secret_message: "My secret message"
image1: <file1.png>
image2: <file2.png>
```

### Frontend Test
1. Navigate to Send Message page
2. Select two different images
3. Both image previews should display
4. Images should be successfully merged and embedded
5. Received stego image should be larger (combined dimensions)

---

## Constraints Verification

✅ **Encryption Logic**: No changes to `encryption_service.py` or encryption/decryption functions  
✅ **Steganography Algorithm**: LSB embed/extract logic unchanged in `embed_message_in_image()` and `extract_message_from_image()`  
✅ **Decoding Logic**: No changes to decryption or extraction endpoints  
✅ **Preprocessing Only**: Only `merge_images()` function added as preprocessing step  

---
