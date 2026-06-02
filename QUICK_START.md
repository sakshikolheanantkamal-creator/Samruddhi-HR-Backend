# 🚀 Cloudinary Quick Start Guide

## Step 1: Add API Secret (2 minutes)

1. Open: https://console.cloudinary.com/settings/api-keys
2. Click on asterisks (••••) in "API Secret" column
3. Copy the revealed secret
4. Open `backend/.env` file
5. Replace `your_api_secret_here` with your actual secret:
   ```env
   CLOUDINARY_API_SECRET=your_copied_secret_here
   ```
6. Save the file

## Step 2: Test Connection (30 seconds)

```bash
cd backend
node test_cloudinary.js
```

Expected output:
```
✅ SUCCESS! Cloudinary connection is working.
```

## Step 3: Start Backend (30 seconds)

```bash
npm run dev
```

## Step 4: Test Upload (1 minute)

1. Open Admin Panel: http://localhost:5174
2. Login
3. Go to any CMS page
4. Upload an image
5. Check response - should see Cloudinary URL:
   ```
   https://res.cloudinary.com/dwt48licd/image/upload/...
   ```

## ✅ Done!

Your images are now stored in the cloud and served via CDN! 🎉

---

## 📝 Need More Details?

- Full documentation: `CLOUDINARY_IMPLEMENTATION_SUMMARY.md`
- Setup guide: `../CLOUDINARY_SETUP.md`

---

**Total Time: ~4 minutes** ⏱️
