# Visual Guide - Dual Image UI Changes

## Before vs After Comparison

---

## 📱 SEND MESSAGE PAGE

### BEFORE: Single Image Input

```
┌────────────────────────────────────────────┐
│     Send Secure Message                    │
└────────────────────────────────────────────┘

┌ Receiver Email ─────────────────────────────┐
│ [receiver@example.com                    □] │
└─────────────────────────────────────────────┘

┌ Secret Message ─────────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │ Type your secret message here...         │ │
│ │                                         │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│ Max length depends on image size            │
└─────────────────────────────────────────────┘

┌ Select Image ───────────────────────────────┐
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │  [IMAGE PREVIEW - single image]         │ │
│ │                                         │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│  [ Choose File / No file chosen ]           │
│                                             │
│  Supported formats: PNG, JPG, BMP, etc.   │
└─────────────────────────────────────────────┘

  [ 🔒 Embed Message in Image ]
```

---

### AFTER: Dual Image Inputs

```
┌────────────────────────────────────────────┐
│     Send Secure Message                    │
└────────────────────────────────────────────┘

┌ Receiver Email ─────────────────────────────┐
│ [receiver@example.com                    □] │
└─────────────────────────────────────────────┘

┌ Secret Message ─────────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │ Type your secret message here...         │ │
│ │                                         │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│ Max length depends on merged image size     │
└─────────────────────────────────────────────┘

┌ Select First Image ─────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │  [IMAGE 1 PREVIEW - landscape photo]    │ │
│ │                                         │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│  [ Choose File / image1.jpg ]               │
│  Supported formats: PNG, JPG, BMP, etc.   │
└─────────────────────────────────────────────┘

┌ Select Second Image ────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │  [IMAGE 2 PREVIEW - portrait photo]     │ │
│ │                                         │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│  [ Choose File / image2.jpg ]               │
│  Images will be merged horizontally,      │
│  resized to same height                   │
└─────────────────────────────────────────────┘

  [ 🔒 Embed Message in Merged Images ]
```

---

## 🖼️ Image Merge Visualization

### Example: Merge Operation

```
Input Images:

Image 1 (Original Size: 500×400)
┌─────────────────────────┐
│                         │
│   Landscape Photo       │
│   (width > height)      │
│                         │
└─────────────────────────┘

Image 2 (Original Size: 300×600)
┌──────────┐
│          │
│ Portrait │ (height > width)
│ Photo    │
│          │
│          │
└──────────┘

Processing Steps:

Target Height = max(400, 600) = 600

Resize Image 1:
- Scale ratio: 600 / 400 = 1.5
- New size: 750 × 600
┌──────────────────────────────┐
│                              │
│   Landscape Photo (Enlarged) │
│                              │
└──────────────────────────────┘

Resize Image 2:
- Scale ratio: 600 / 600 = 1.0
- New size: 300 × 600 (unchanged)
┌──────────┐
│          │
│ Portrait │
│ Photo    │
│          │
│          │
└──────────┘

Merge Result (Horizontal concatenation):

┌──────────────────────────────┬──────────┐
│                              │          │
│                              │          │
│   Landscape Photo (750×600)  │ Portrait │
│                              │ Photo    │
│                              │(300×600) │
│                              │          │
└──────────────────────────────┴──────────┘

Final Output: 1050 × 600 PNG image
```

---

## 🎨 Form Input Comparison

### State Variables Before

```javascript
const [image, setImage] = useState(null);
const [imagePreview, setImagePreview] = useState(null);

// Single image handler
const handleImageChange = (e) => {
  const file = e.target.files[0];
  setImage(file);
  // ... preview ...
};
```

### State Variables After

```javascript
const [image1, setImage1] = useState(null);
const [image2, setImage2] = useState(null);
const [imagePreview1, setImagePreview1] = useState(null);
const [imagePreview2, setImagePreview2] = useState(null);

// First image handler
const handleImageChange1 = (e) => {
  const file = e.target.files[0];
  setImage1(file);
  // ... preview ...
};

// Second image handler
const handleImageChange2 = (e) => {
  const file = e.target.files[0];
  setImage2(file);
  // ... preview ...
};
```

---

## 📊 Success Screen

### After Successful Embedding (Unchanged)

```
┌────────────────────────────────────────────┐
│   ✓ Message Embedded Successfully!         │
└────────────────────────────────────────────┘

┌ Encryption Key ─────────────────────────────┐
│ Encryption Key:                             │
│ [gAAAAABa3X2Kcw9DhZ3_e7j1mNOp4F    ] [Copy] │
│                                             │
│ ⚠️  Keep this key safe! The receiver will   │
│ need it to decrypt the message.             │
└─────────────────────────────────────────────┘

  [ 📥 Download Stego Image ]
  [ 📧 Share Via Email ]
  [ Send Another Message ]
```

---

## 🔄 User Workflow Comparison

### BEFORE

```
1. User goes to /send-message
2. Fills: Email + Message + ONE Image
3. Clicks: "Embed Message in Image"
4. Gets: Stego image with encrypted message
5. Downloads/Shares stego image
```

### AFTER

```
1. User goes to /send-message
2. Fills: Email + Message + TWO Images
3. System: Merges two images automatically
4. Clicks: "Embed Message in Merged Images"
5. Gets: Larger stego image (merged + encrypted)
6. Downloads/Shares larger stego image
   (Receiver has same extraction flow - unchanged)
```

---

## 📈 Backend Processing Comparison

### BEFORE

```
POST /api/embed
├─ Input: image (single file)
├─ Process:
│  ├─ Read image bytes
│  ├─ Generate AES key
│  ├─ Encrypt message
│  └─ LSB embed in image
└─ Output: stego_image + encryption_key
```

### AFTER

```
POST /api/embed
├─ Input: image1, image2 (two files)
├─ Process:
│  ├─ Read image1 and image2 bytes
│  ├─ merge_images(image1, image2)    ← NEW STEP
│  │  ├─ Resize to same height
│  │  ├─ Merge horizontally
│  │  └─ Output merged PNG
│  ├─ Generate AES key
│  ├─ Encrypt message
│  └─ LSB embed in merged image
└─ Output: stego_image + encryption_key
```

---

## 🎯 Validation Changes

### BEFORE

```javascript
if (!receiverEmail || !secretMessage || !image) {
  setError('Please fill all fields');
  return;
}
```

### AFTER

```javascript
if (!receiverEmail || !secretMessage || !image1 || !image2) {
  setError('Please fill all fields including both images');
  return;
}
```

---

## 📡 API Call Comparison

### BEFORE

```javascript
const formData = new FormData();
formData.append('receiver_email', email);
formData.append('secret_message', message);
formData.append('image', image);

POST /api/embed
```

### AFTER

```javascript
const formData = new FormData();
formData.append('receiver_email', email);
formData.append('secret_message', message);
formData.append('image1', image1);  ← TWO images
formData.append('image2', image2);

POST /api/embed
```

---

## 🔍 Visual Size Comparison

### Example: How Output Size Changes

```
Input Scenario:
├─ Image 1: 1280×720 (landscape)  → ~200KB PNG
├─ Image 2: 720×1280 (portrait)   → ~150KB PNG
└─ Total input: ~350KB

Processing:
├─ Resize Image 1: 1280×720 (unchanged)
├─ Resize Image 2: 720×1280 → 1280×1280 (scaled)
├─ Merge: 1280×1280 + 1280×1280 = 2560×1280
└─ Result: ~800KB merged PNG

Steganography:
├─ Original capacity (single image): ~1-2MB message
├─ New capacity (merged image): ~3-4MB message
└─ Stego image: ~1.5-2MB PNG

Receiver gets:
├─ Stego image: ~1.5-2MB (vs ~400KB before)
├─ Encryption key: ~100 bytes (unchanged)
└─ Total: ~1.5-2MB (2-3x larger file size)
```

---

## 🚨 Error Scenarios

### New Error Message

```
Could not merge images properly
│
├─ Corrupted first image
│  └─ Solution: Use different image file
├─ Corrupted second image
│  └─ Solution: Use different image file
├─ Unsupported format
│  └─ Solution: Convert to PNG/JPG
├─ Out of memory
│  └─ Solution: Use smaller images
└─ Merge failed
   └─ Solution: Verify both images readable
```

---

## 📋 Form Field Checklist

### User sees before submission:

```
☐ Receiver Email (required)
☐ Secret Message (required)
☐ First Image (NEW - required)
  ├─ Preview thumbnail
  └─ File name indicator
☐ Second Image (NEW - required)
  ├─ Preview thumbnail
  └─ "Will be merged horizontally" note
☐ Submit button text updated: "Embed Message in Merged Images"
```

---

## ✅ Testing: Visual Checklist

When you test, verify you see:

- [ ] Form has TWO separate image input fields
- [ ] Labels say "First Image" and "Second Image"
- [ ] Each image shows a separate preview
- [ ] Second image has note: "Images will be merged horizontally, resized to same height"
- [ ] Button text says: "🔒 Embed Message in Merged Images"
- [ ] Error message mentions "both images" if only one selected
- [ ] "Send Another Message" button resets both image previews
- [ ] Downloaded stego image is visibly larger than single image case

---

## 🎨 CSS Classes Used (Unchanged)

```jsx
// All existing Tailwind classes retained:
"w-full"                    // Full width
"bg-gray-800"               // Dark background
"bg-gray-700"               // Slightly lighter
"mt-1"                      // Margin top
"p-2"                       // Padding
"rounded-lg"                // Border radius
"focus:ring-2"              // Focus state
"focus:ring-blue-500"       // Blue focus
"text-white"                // White text
"text-gray-300"             // Light gray text
"text-gray-400"             // Darker gray text
"max-h-64"                  // Max height for preview
"mb-4"                      // Margin bottom
// ... etc (same as before)
```

**No CSS changes needed** - Responsive design works for both single and dual inputs!

---

## 🎯 Color Scheme (Unchanged)

```
Background:     #111827 (bg-gray-900)
Card:           #1F2937 (bg-gray-800)
Inputs:         #374151 (bg-gray-700)
Text:           #FFFFFF (white)
Labels:         #D1D5DB (gray-300)
Success:        #4ADE80 (green)
Error:          #F87171 (red)
Focus Ring:     #3B82F6 (blue)
```

---

**Summary:** The UI changes are **minimal and intuitive** - just replacing one image field with two, same styling, same layout flow!

---
