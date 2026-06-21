# X Shop Frontend Components

Vue 3 + TypeScript components for X Shop SaaS platform.

## Components Created

### 1. **Dashboard.vue** (`/xshop`)
Main dashboard showing:
- Product statistics (Total, With Price, In Stock, Categorized)
- Sync Products button
- Recent sync history (last 5)
- Quick overview of system

### 2. **Products.vue** (`/xshop/products`)
Product listing page with:
- Search functionality (debounced)
- Status filter (Active/Inactive)
- Grid layout with product cards
- Pagination support
- Click to view details

### 3. **ProductDetail.vue** (`/xshop/product/:id`)
Single product view showing:
- Product images (or placeholder if not available)
- Name, category, status badges
- Price and stock information
- Full metadata from API
- Brand, colors, sizes
- Pricing variants
- Raw API data viewer

### 4. **SyncHistory.vue** (`/xshop/sync-history`)
Sync logs page with:
- Timeline of all syncs
- Success/failure indicators
- Sync details (products synced, errors)
- Manual "Sync Now" button
- Pagination for history

## Routes Configuration

```typescript
/xshop                  → Dashboard
/xshop/products         → Products List
/xshop/product/:id      → Product Detail
/xshop/sync-history     → Sync History
```

## API Integration

All components connect to backend endpoints:

- `GET /client/api/i/ona/xshop?action=get_products` - List products
- `POST /client/api/i/ona/xshop?action=get_product` - Get single product
- `POST /client/api/i/ona/xshop?action=sync_products` - Sync from external API
- `GET /client/api/i/ona/xshop?action=get_sync_logs` - Get sync history

## Authentication

All requests include Bearer token from localStorage:
```javascript
localStorage.getItem('access_token')
```

## Features

✅ URL-based navigation with Vue Router  
✅ Responsive design  
✅ Loading states  
✅ Error handling  
✅ Empty states  
✅ Pagination  
✅ Search & filters  
✅ Real-time data from backend  

## Component Structure

```
hydrator/src/
├── App.vue              # Main app container
├── main.ts              # Vue app initialization
├── router.ts            # Route configuration
├── Dashboard.vue        # Dashboard fragment
├── Products.vue         # Products list fragment
├── ProductDetail.vue    # Product detail fragment
└── SyncHistory.vue      # Sync history fragment
```

## Usage

These are **fragments** (right-side content only). No sidebar, header, or footer included.

### Navigation Example

```typescript
// In component
import { useRouter } from 'vue-router';

const router = useRouter();

// Navigate to products
router.push('/xshop/products');

// Navigate to specific product
router.push(`/xshop/product/${productId}`);

// Go back
router.back();
```

### API Call Example

```typescript
const response = await fetch('/client/api/i/ona/xshop?action=get_products', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

## Data Flow

1. **User visits `/xshop`** → Dashboard loads stats from API
2. **User clicks "Products"** → Navigates to `/xshop/products`
3. **Products load from backend** → Displays in grid with filters
4. **User clicks product card** → Navigates to `/xshop/product/:id`
5. **Product detail loads** → Shows full info with metadata
6. **User syncs products** → POST to sync endpoint → Updates data

## Styling

- Modern, clean UI inspired by Twitter/X design
- Responsive grid layouts
- Smooth transitions and hover effects
- Status badges with color coding
- Card-based design
- Mobile-friendly

## Key Features by Component

### Dashboard
- 📊 Real-time statistics
- 🔄 Quick sync action
- 📝 Recent activity feed

### Products
- 🔍 Search products by name
- 🎯 Filter by status
- 📄 Pagination support
- 🖼️ Image thumbnails (with fallback)
- 💰 Price and stock display

### Product Detail
- 🖼️ Image gallery
- 📋 Complete product info
- 🏷️ Category and brand tags
- 💵 Pricing variants
- 🔧 Raw API data inspector

### Sync History
- ⏱️ Chronological timeline
- ✅ Success/error indicators
- 📊 Sync statistics
- 🔄 Manual sync trigger

## Notes

- All components use Composition API (script setup)
- TypeScript for type safety
- Proper error handling and loading states
- Graceful handling of missing data (images, prices, etc.)
- No external UI libraries - pure Vue + CSS
