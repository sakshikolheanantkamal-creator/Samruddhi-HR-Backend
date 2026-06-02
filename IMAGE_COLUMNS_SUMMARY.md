# Image Columns in All Tables

## ✅ Tables with Image Columns

### 1. **industries** Table
- **image** - VARCHAR(255) ← **NEW!**
- icon - VARCHAR(50)
- title - VARCHAR(150)
- description - TEXT
- color - VARCHAR(20)

### 2. **manpower_services** Table
- **image** - VARCHAR(255) ← **NEW!**
- icon - VARCHAR(50)
- title - VARCHAR(150)
- description - TEXT
- features - JSONB
- color - VARCHAR(20)

### 3. **services** Table
- **hero_image** - VARCHAR(255)
- **other_image** - VARCHAR(255)
- slug - VARCHAR(100)
- title - VARCHAR(100)
- tagline - VARCHAR(255)
- overview - TEXT

### 4. **home** Table
- **hero_image** - VARCHAR(255)
- hero_badge - VARCHAR(255)
- hero_title - VARCHAR(255)
- hero_desc_1 - TEXT
- hero_desc_2 - TEXT
- hero_desc_3 - TEXT

### 5. **about** Table
- **image_url** - VARCHAR(255)
- paragraphs - JSONB
- vision - TEXT
- missions - JSONB
- features - JSONB

### 6. **careers_content** Table
- **hero_image_url** - VARCHAR(255)
- hero_badge - VARCHAR(255)
- hero_heading_line_1 - VARCHAR(255)
- hero_heading_line_2 - VARCHAR(255)

### 7. **footer** Table
- **logo** - VARCHAR(255) ← **NEW!**
- company_name - VARCHAR(150)
- tagline - TEXT
- description - TEXT

### 8. **applications** Table
- **resume_path** - VARCHAR(255) (for resume files)
- full_name - VARCHAR(100)
- email - VARCHAR(100)

---

## 📊 Image Storage Options

You're using **Cloudinary** for image storage, so image columns should store:
- Cloudinary URLs: `https://res.cloudinary.com/dwt48llcd/image/upload/...`
- Or Cloudinary public IDs: `folder/image-name`

---

## 🔧 Updated Models

The following models have been updated to support image fields:

✅ **Industry.js** - Added `image` parameter to create() and update()
✅ **ManpowerService.js** - Added `image` parameter to create() and update()
✅ **Footer.js** - Added `logo` parameter to upsert()

---

## 📝 Usage Examples

### Update Industry with Image
```javascript
import Industry from './models/Industry.js';

await Industry.update(1, {
  title: 'Manufacturing',
  image: 'https://res.cloudinary.com/dwt48llcd/image/upload/v1234/manufacturing.jpg'
});
```

### Update Manpower Service with Image
```javascript
import ManpowerService from './models/ManpowerService.js';

await ManpowerService.update(1, {
  title: 'Contract Staffing',
  image: 'https://res.cloudinary.com/dwt48llcd/image/upload/v1234/staffing.jpg'
});
```

### Update Footer with Logo
```javascript
import Footer from './models/Footer.js';

await Footer.upsert({
  company_name: 'Samruddhi HR Services',
  logo: 'https://res.cloudinary.com/dwt48llcd/image/upload/v1234/logo.png'
});
```

---

## 🎯 Next Steps

1. ✅ Image columns added to database
2. ✅ Models updated to support images
3. ✅ Cloudinary is already configured
4. Restart backend server: `npm run dev`
5. Upload images through admin panel
6. Images will be stored in Cloudinary
7. Image URLs will be saved in database

---

## ✅ Summary

**New Image Columns Added:**
- industries.image
- manpower_services.image
- footer.logo

**Existing Image Columns:**
- services.hero_image & services.other_image
- home.hero_image
- about.image_url
- careers_content.hero_image_url
- applications.resume_path

**Total Tables with Image Support:** 8/16 tables

All image columns are ready to use with Cloudinary integration!
