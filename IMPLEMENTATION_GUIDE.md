# Dual Image Implementation - Quick Reference & Testing Guide

## 🎯 What Changed

**Before:** Single image upload → Direct steganography  
**After:** Two image uploads → Merge → Steganography

---

## 📋 Files Modified (5 Total)

### Backend (2 files)
1. **`backend/services/steganography_service.py`** 
   - Added `merge_images()` function
   - Import: Added `Optional` type hint

2. **`backend/routes/message_routes.py`**
   - `/embed` endpoint accepts `image1` and `image2`
   - Added merge preprocessing step

### Frontend (2 files)
3. **`frontend/src/utils/api.js`**
   - `embedMessage()` now sends two images

4. **`frontend/src/pages/SendMessage.jsx`**
   - Dual image input UI
   - Separate state for each image
   - Updated validation and API calls

### Documentation (1 file)
5. **`README.md`**
   - Updated features, workflow, API docs
   - New technical details about image merging

---

## 🔄 New Data Flow

```
User Input
    ↓
[Image 1] + [Image 2] + [Message] + [Receiver Email]
    ↓
FRONTEND (SendMessage.jsx)
    ├─ Validate: Both images + message + email filled
    ├─ Call: embedMessage(email, message, image1, image2)
    └─ Send: FormData with image1, image2, message, email
    ↓
BACKEND (/api/embed endpoint)
    ├─ Read: image1_bytes and image2_bytes
    ├─ Process: merge_images(image1_bytes, image2_bytes)
    │   ├─ Open both images
    │   ├─ Convert to RGB
    │   ├─ Resize to same height (maintain aspect ratio)
    │   ├─ Merge horizontally (side-by-side)
    │   └─ Return merged_image_bytes
    ├─ Encrypt: AES encryption of message
    ├─ Embed: LSB steganography in merged image
    └─ Return: stego_image + encryption_key
    ↓
FRONTEND (SendMessage.jsx)
    ├─ Display: Success message + encryption key
    ├─ Download: stego_image.png (>original images)
    └─ Share: Via email or download
    ↓
Receiver
    ├─ Upload: stego_image.png
    ├─ Provide: encryption_key
    └─ Extract: Original message
```

---

## 🧪 Testing Checklist

### Unit Test: Image Merging
```python
from services import merge_images
import os

# Test with two sample images
with open('image1.png', 'rb') as f1:
    img1_bytes = f1.read()
with open('image2.jpg', 'rb') as f2:
    img2_bytes = f2.read()

merged = merge_images(img1_bytes, img2_bytes)
assert merged is not None, "Merge failed"

# Save to verify
with open('merged_result.png', 'wb') as f:
    f.write(merged)
print("✓ Image merge successful")
```

### Integration Test: Full Embed Flow
```bash
# 1. Frontend sends two images
POST /api/embed
{
  "receiver_email": "recipient@example.com",
  "secret_message": "Hello World",
  "image1": <file1>,
  "image2": <file2>
}

# Expected response
{
  "success": true,
  "encryption_key": "gAAAAABa...",
  "stego_image": "89504e47...(hex)",
  "image_filename": "stego_image_xxx.png"
}

# 2. Verify stego image is larger than input images
# 3. Test extraction with same encryption key
```

### Manual Testing (UI)
1. **Navigate** to `/send-message`
2. **Fill** form:
   - Receiver email: any registered user
   - Secret message: test text
   - Image 1: landscape photo
   - Image 2: portrait photo
3. **Verify**:
   - Both previews display
   - Button says "Embed Message in Merged Images"
   - Success after submission
4. **Check** encryption key is displayed
5. **Download** and verify PNG file created
6. **Extract** message from different account using key

### Edge Cases to Test
- ✓ One image much larger than the other
- ✓ Images with different aspect ratios
- ✓ PNG, JPG, BMP format combinations
- ✓ Images with transparency (RGBA)
- ✓ Very large image files (>10MB)
- ✓ Very small images (<100x100)
- ✓ Missing second image (should show error)

---

## 📊 Image Merging Logic Details

### Algorithm: Horizontal Merge with Height Normalization
```
Input: Image1 (1920x1080), Image2 (1280x720)

Step 1: Get dimensions
  - Image1: W1=1920, H1=1080
  - Image2: W2=1280, H2=720
  - Target Height = max(1080, 720) = 1080

Step 2: Calculate scale ratios
  - Ratio1 = 1080/1080 = 1.0
  - Ratio2 = 1080/720 = 1.5

Step 3: Calculate new dimensions
  - New W1 = 1920 * 1.0 = 1920
  - New W2 = 1280 * 1.5 = 1920

Step 4: Resize images (LANCZOS filter)
  - Image1 resized to 1920x1080 (no change)
  - Image2 resized to 1920x1080

Step 5: Create canvas
  - Canvas width = 1920 + 1920 = 3840
  - Canvas height = 1080

Step 6: Paste images
  - Image1 at position (0, 0)
  - Image2 at position (1920, 0)

Output: Merged image 3840x1080
  [Image1 (1920x1080) | Image2 (1920x1080)]
```

### Key Features
- **Horizontal layout**: Images placed side-by-side
- **Height matching**: Both resized to max height
- **Aspect ratio**: Preserved before merging
- **Color mode**: Converted to RGB (8 bits per channel)
- **Format**: Output as PNG (lossless)
- **Capacity**: Total capacity ≈ 2x single image

---

## 🔐 Security Implications

### Unchanged Components
✅ **AES-256 encryption** - Same key generation and encryption/decryption  
✅ **LSB steganography** - Same bit embedding algorithm  
✅ **JWT authentication** - Same token validation  
✅ **Face recognition** - Same face encoding and comparison  

### New Security Consideration
- **Merged image size**: Two images create larger stego image
  - Advantage: ⬆️ Capacity (more room for hidden message)
  - Advantage: ⬆️ Stealth (larger file size might be less suspicious)
  - No security downside: Still encrypted before embedding

---

## 🚀 Deployment Checklist

- [ ] Backend changes deployed
  - `steganography_service.py` with `merge_images()`
  - `message_routes.py` with updated `/embed` endpoint
- [ ] Frontend changes deployed
  - `SendMessage.jsx` with dual image inputs
  - `api.js` with updated `embedMessage()`
- [ ] Updated documentation
  - README.md changes
  - DUAL_IMAGE_CHANGES.md created
- [ ] Tested end-to-end
  - Send with two images
  - Receive and extract message
  - Verify encryption key works
- [ ] Backward compatibility
  - Old extraction still works (no changes to `/extract` endpoint)
  - Database schema unchanged

---

## 💡 Troubleshooting

### Issue: "Failed to merge images"
**Cause:** Image format not supported  
**Solution:** Ensure images are PNG, JPG, or BMP

### Issue: "Image 2 is always null"
**Cause:** Form not sending second image  
**Solution:** Check browser console, verify `image2` in FormData

### Issue: Merged image is very large
**Cause:** Two high-res images merged  
**Solution:** Normal behavior - capacity is larger but file is encodable

### Issue: "Failed to embed message in image"
**Cause:** Message too long for merged image  
**Solution:** Use smaller message or larger images

### Issue: Frontend shows old UI (single image)
**Cause:** Cached version displayed  
**Solution:** Hard refresh (Ctrl+Shift+R) or clear cache

---

## 📞 Support

For issues:
1. Check DUAL_IMAGE_CHANGES.md for exact code changes
2. Verify both files exist and are selected
3. Check browser console for errors
4. Check server logs for backend errors
5. Verify Python PIL/Pillow is installed on backend

---

## 🎓 Learning Resources

### Image Processing
- [Python Pillow Docs](https://pillow.readthedocs.io/)
- [Image Resizing Methods](https://en.wikipedia.org/wiki/Image_scaling)

### Steganography
- [LSB Steganography](https://en.wikipedia.org/wiki/Least_significant_bit)
- [Capacity Calculation](https://en.wikipedia.org/wiki/Steganography#Capacity)

### React/Frontend
- [React Hooks](https://react.dev/reference/react)
- [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

---
