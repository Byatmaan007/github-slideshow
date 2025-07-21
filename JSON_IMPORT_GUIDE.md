# JSON Import Guide for Your E-Commerce Database

This guide shows you how to import your own data into the MongoDB database using JSON files.

## Available Import Endpoints

### 1. Complete Data Import (Recommended)
**Endpoint:** `POST /api/import/complete-data`

This imports both products and culture stories in one go:

```json
{
  "products": [
    // Your product array here
  ],
  "culture_stories": [
    // Your culture stories array here  
  ]
}
```

### 2. Products Only Import
**Endpoint:** `POST /api/import/products`

### 3. Culture Stories Only Import
**Endpoint:** `POST /api/import/culture-stories`

### 4. Export Existing Data
- **Export Products:** `GET /api/export/products`
- **Export Culture Stories:** `GET /api/export/culture-stories`

## Product JSON Format

Each product must have these fields:

```json
{
  "name": "Your Suit Name",
  "description": "Detailed description of your suit",
  "price": 999.99,
  "original_price": 1299.99,  // Optional: for showing discounts
  "suit_type": "business",    // Options: business, formal, wedding, casual, tuxedo
  "fabric": "wool",           // Options: wool, cotton, silk, linen, blend
  "fabric_description": "100% Premium Wool with natural stretch",
  "colors": ["Black", "Navy", "Charcoal"],
  "sizes": ["S", "M", "L", "XL", "XXL"],
  "image_url": "https://your-image-url.com/image.jpg",
  "additional_images": ["url1", "url2"],  // Optional
  "care_instructions": "Dry clean only",
  "in_stock": true,
  "stock_quantity": 50,
  "featured": true            // Show on homepage
}
```

## Culture Story JSON Format

Each culture story must have these fields:

```json
{
  "title": "Story Title",
  "content": "Full story content here...",
  "image_url": "https://your-image-url.com/story-image.jpg",
  "category": "heritage",     // Options: heritage, craftsmanship, culture, sustainability, artisans
  "featured": true            // Show prominently
}
```

## How to Import Your Data

### Method 1: Using API Tool (like Postman)
1. Create your JSON file with the format above
2. Send POST request to `http://your-domain/api/import/complete-data`
3. Set Content-Type to `application/json`
4. Paste your JSON data in the body

### Method 2: Using curl command
```bash
curl -X POST "http://your-domain/api/import/complete-data" \
  -H "Content-Type: application/json" \
  -d @your-data.json
```

### Method 3: Let me help you import
1. Prepare your JSON data
2. Share it with me
3. I'll import it for you

## Important Notes

- **IDs are auto-generated:** Don't include "id" fields in your JSON
- **Images:** Use full URLs to your product images
- **Data Replacement:** Import will replace existing data completely
- **Validation:** All required fields must be present
- **Backup:** Consider exporting existing data first as backup

## Example Complete JSON File

See `sample-import-data.json` for a complete example with multiple products and stories.