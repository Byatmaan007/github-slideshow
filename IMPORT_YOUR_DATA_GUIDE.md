# 🇳🇵 Complete Guide to Import Your Data

## 🎯 What You Can Do Now

You now have a complete JSON import/export system to replace the demo data with your authentic suit brand data!

## 🚀 Quick Start - 3 Easy Ways to Import Your Data

### Method 1: Web Interface (Easiest) ⭐
1. **Visit**: `https://your-domain/api/import-tool` 
2. **Upload**: Your JSON file or paste JSON data
3. **Click**: "Import Data" button
4. **Done**: Your data is live!

### Method 2: API Call (For Developers)
```bash
curl -X POST "https://your-domain/api/import/complete-data" \
  -H "Content-Type: application/json" \
  -d @your-data.json
```

### Method 3: Let Me Do It For You
Send me your data and I'll import it instantly!

---

## 📋 What Data You Need to Prepare

### 🔸 Products Data
For each suit you sell, provide:
- **Name**: "Premium Executive Suit" 
- **Description**: Detailed product description
- **Price**: 1299.99 (current price)
- **Original Price**: 1699.99 (optional, for discounts)
- **Suit Type**: business, formal, wedding, casual, tuxedo
- **Fabric**: wool, cotton, silk, linen, blend
- **Fabric Description**: "100% Premium Wool with natural stretch"
- **Colors**: ["Black", "Navy", "Charcoal"]
- **Sizes**: ["S", "M", "L", "XL", "XXL"]
- **Image URL**: "https://your-image-url.com/suit1.jpg"
- **Additional Images**: ["url1", "url2"] (optional)
- **Care Instructions**: "Dry clean only"
- **In Stock**: true/false
- **Stock Quantity**: 50
- **Featured**: true (show on homepage)

### 🔸 Brand Story Data
For your Nepal heritage content:
- **Title**: "Our Family Heritage"
- **Content**: Full story text about your brand/culture
- **Image URL**: "https://your-image-url.com/story1.jpg"
- **Category**: heritage, craftsmanship, culture, sustainability, artisans
- **Featured**: true (show prominently)

---

## 📄 JSON Format Template

```json
{
  "products": [
    {
      "name": "Your Suit Name",
      "description": "Your suit description...",
      "price": 999.99,
      "original_price": 1299.99,
      "suit_type": "business",
      "fabric": "wool",
      "fabric_description": "100% Premium Wool",
      "colors": ["Black", "Navy"],
      "sizes": ["S", "M", "L", "XL"],
      "image_url": "https://your-image-url.com",
      "additional_images": [],
      "care_instructions": "Dry clean only",
      "in_stock": true,
      "stock_quantity": 50,
      "featured": true
    }
  ],
  "culture_stories": [
    {
      "title": "Your Story Title",
      "content": "Your brand story content...",
      "image_url": "https://your-story-image.com",
      "category": "heritage",
      "featured": true
    }
  ]
}
```

---

## 🛠️ Available Tools & Endpoints

### Import Endpoints
- **Complete Import**: `POST /api/import/complete-data`
- **Products Only**: `POST /api/import/products`
- **Culture Stories Only**: `POST /api/import/culture-stories`

### Export Endpoints (for backup)
- **Export Products**: `GET /api/export/products`
- **Export Culture Stories**: `GET /api/export/culture-stories`

### Helper Resources
- **Import Tool**: `https://your-domain/api/import-tool`
- **Sample Data**: `https://your-domain/api/sample-import-data.json`
- **This Guide**: `https://your-domain/api/import-guide.md`

---

## 🎯 What Happens When You Import

1. **Replaces All Data**: Your import completely replaces existing demo data
2. **Generates IDs**: System automatically creates unique IDs for each item
3. **Validates Data**: Checks all required fields are present
4. **Updates Website**: Changes appear immediately on your live site
5. **Maintains Structure**: All existing features (cart, payments, etc.) continue working

---

## ✅ Success Examples

### ✅ Successful Import Response
```json
{
  "message": "Data import completed successfully",
  "imported_products": 15,
  "imported_stories": 8
}
```

### ❌ Error Response (Missing Required Field)
```json
{
  "detail": "Import failed: field required: name"
}
```

---

## 🚨 Important Notes

- **Backup First**: Consider exporting current data before importing
- **Image URLs**: Use full URLs to your product images (hosted elsewhere)
- **Required Fields**: All marked fields must be provided
- **Data Replacement**: Import replaces ALL existing data
- **Instant Update**: Changes appear immediately on your website

---

## 📞 Need Help?

1. **Sample Data**: Download the sample file to see exact format
2. **Test Import**: Try importing the sample data first
3. **Ask Me**: Send me your data and I'll import it for you
4. **Export First**: Backup your current data before making changes

---

## 🎉 Next Steps

1. Prepare your product photos and descriptions
2. Write your authentic Nepal brand story
3. Format your data using the template above
4. Import using the web tool or ask me to help
5. Your authentic suit store is live! 🚀