# X Shop SaaS - Full Stack Setup Guide

Complete multi-tenant SaaS platform connecting sellers with X (Twitter) for e-commerce.

---

## 🏗️ Architecture

```
Frontend (Vue 3 + TypeScript)
         ↓
    API Layer (CORS enabled)
         ↓
Backend (FastAPI + PostgreSQL)
         ↓
External Product API + X OAuth
```

---

## 📁 Project Structure

```
X shop backend/
└── X_shop_backend/
    └── dryutil/
        └── backend/python/fastapi/project/
            ├── src/
            │   ├── index.py (CORS enabled ✓)
            │   ├── parties/party_2/routes/
            │   └── shared/utility/l/xshop/
            ├── alembic/
            └── .env

X shop/
└── X_Shope/
    └── Frontend/
        └── src/hydrator/src/
            ├── Dashboard.vue
            ├── Products.vue
            ├── ProductDetail.vue
            ├── SyncHistory.vue
            ├── router.ts
            ├── api.ts
            └── main.ts
```

---

## 🚀 Backend Setup

### 1. Install Dependencies

```bash
cd "c:\Users\nitin\Desktop\X\X shop backend\X_shop_backend\dryutil\backend\python\fastapi\project"
pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary python-dotenv httpx
```

### 2. Environment Variables (.env)

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/xshop_db
JWT_SECRET_KEY=your-secret-key-here
PRODUCT_API_URL=https://fastapi.dryutil.1mn.io/client/api/i/ona/product_dir
PRODUCT_API_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
X_CLIENT_ID=your-x-client-id
X_CLIENT_SECRET=your-x-client-secret
X_REDIRECT_URI=http://localhost:8000/client-public/api/i/ona/x_oauth_callback
```

### 3. Database Setup

```bash
# Run migrations
alembic upgrade head
```

### 4. Start Backend

```bash
uvicorn src.index:app --reload --host 0.0.0.0 --port 8000
```

**Backend URLs:**
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- Public API Docs: http://localhost:8000/client-public/docs
- Private API Docs: http://localhost:8000/client/docs

---

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd "c:\Users\nitin\Desktop\X\X shop\X_Shope\Frontend"
npm install
```

### 2. Environment Variables (.env.local)

```env
VITE_API_URL=http://localhost:8000
```

### 3. Start Frontend

```bash
npm run dev
```

**Frontend URL:** http://localhost:5173

---

## 🔗 API Integration

### Authentication Flow

1. **Register/Login** → Get `access_token`
2. **Store token** → `localStorage.setItem('access_token', token)`
3. **API Requests** → Include Bearer token in headers

### API Endpoints

#### Public Endpoints (No Auth Required)
```
POST /client-public/api/i/ona/auth?action=register
POST /client-public/api/i/ona/auth?action=login
POST /client-public/api/i/ona/auth?action=refresh_token
GET  /client-public/api/i/ona/x_oauth_callback
```

#### Private Endpoints (Bearer Token Required)
```
GET  /client/api/i/ona/xshop?action=get_products
POST /client/api/i/ona/xshop?action=get_product
POST /client/api/i/ona/xshop?action=sync_products
GET  /client/api/i/ona/xshop?action=get_sync_logs
```

### Example API Call

```typescript
import api from './api';

// Get products
const data = await api.xshop.getProducts({ page: 1, limit: 20 });

// Sync products
const result = await api.xshop.syncProducts();
```

---

## 🗺️ Frontend Routes

```
/xshop                  → Dashboard (stats, quick actions)
/xshop/products         → Products List (search, filters, pagination)
/xshop/product/:id      → Product Detail (full info, metadata)
/xshop/sync-history     → Sync History (timeline, logs)
```

### Navigation

```typescript
import { useRouter } from 'vue-router';

const router = useRouter();

// Go to products
router.push('/xshop/products');

// Go to product detail
router.push(`/xshop/product/${productId}`);

// Go back
router.back();
```

---

## 🎯 Key Features

### Backend
- ✅ Multi-tenant architecture (seller isolation)
- ✅ JWT authentication with refresh tokens
- ✅ X (Twitter) OAuth 2.0 with PKCE
- ✅ Auto token refresh
- ✅ Product sync from external API
- ✅ Scheduled sync (every 6 hours)
- ✅ CORS enabled for frontend
- ✅ Swagger documentation
- ✅ PostgreSQL with Alembic migrations

### Frontend
- ✅ Vue 3 + Composition API
- ✅ TypeScript for type safety
- ✅ Vue Router for navigation
- ✅ Responsive design
- ✅ API helper module
- ✅ Loading & error states
- ✅ Search & filters
- ✅ Pagination
- ✅ Real-time data sync

---

## 📊 Database Schema

### Tables (13 total)

```sql
xshop_seller                  -- Seller accounts
xshop_seller_profile          -- Seller profile info
xshop_store                   -- Store settings
xshop_x_account               -- Connected X accounts
xshop_oauth_token             -- X OAuth tokens
xshop_product                 -- Synced products
xshop_product_sync_log        -- Sync history
xshop_publish_job             -- X post jobs
xshop_order                   -- Orders
xshop_analytics_event         -- Analytics
xshop_seller_refresh_token    -- JWT refresh tokens
xshop_published_post          -- Published X posts
xshop_scheduler_job           -- Scheduled tasks
```

---

## 🔄 Product Sync Flow

```
1. User clicks "Sync Products"
   ↓
2. Frontend calls /xshop?action=sync_products
   ↓
3. Backend fetches from external API
   ↓
4. Parse products (name, price, stock, images)
   ↓
5. Upsert to database (by external_product_id)
   ↓
6. Log sync result to xshop_product_sync_log
   ↓
7. Return stats to frontend
   ↓
8. Frontend updates UI
```

### Data Extraction

```python
# Product fields from API
name = api_product.slug              # "adidas-uuid"
price = api_product.variant_prices[0]  # 160.00
stock = api_product.variant_stock_idx[0]  # 7
category = " ".join(api_product.category)  # "Boys Clothing Jeans"
images = [api_product.url]  # Image URLs
```

---

## 🧪 Testing

### Backend Test

```bash
curl -X POST http://localhost:8000/client/api/i/ona/xshop?action=sync_products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{}"
```

### Frontend Test

1. Open http://localhost:5173/xshop
2. Click "Sync Products"
3. Navigate to Products list
4. Click on a product
5. View product details

---

## 🔐 Security

- JWT tokens with expiration
- Refresh token rotation
- HTTPS recommended for production
- CORS configured
- SQL injection protection (SQLAlchemy ORM)
- Password hashing (bcrypt)
- X OAuth 2.0 with PKCE S256

---

## 📈 Production Deployment

### Backend

```bash
# Use production ASGI server
gunicorn src.index:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Or with Uvicorn
uvicorn src.index:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend

```bash
# Build for production
npm run build

# Deploy dist/ folder to CDN/hosting
```

### Environment Variables (Production)

```env
# Backend
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
JWT_SECRET_KEY=strong-random-secret
PRODUCT_API_URL=https://api.example.com/products
X_CLIENT_ID=prod-client-id
X_CLIENT_SECRET=prod-client-secret
X_REDIRECT_URI=https://yourdomain.com/callback

# Frontend
VITE_API_URL=https://api.yourdomain.com
```

---

## 🐛 Troubleshooting

### CORS Error
✅ Fixed: CORS middleware added to `src/index.py`

### 401 Unauthorized
- Check access_token in localStorage
- Token might be expired - login again

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env

### Product Sync Fails
- Verify PRODUCT_API_TOKEN is valid
- Check external API is accessible

---

## 📝 Quick Start Commands

```bash
# Backend
cd "c:\Users\nitin\Desktop\X\X shop backend\X_shop_backend\dryutil\backend\python\fastapi\project"
uvicorn src.index:app --reload

# Frontend
cd "c:\Users\nitin\Desktop\X\X shop\X_Shope\Frontend"
npm run dev

# Test sync
curl -X POST http://localhost:8000/client/api/i/ona/xshop?action=sync_products \
  -H "Authorization: Bearer TOKEN" -d "{}"
```

---

## 🎉 Features Complete

✅ Multi-tenant SaaS architecture  
✅ X (Twitter) OAuth integration  
✅ Product management system  
✅ External API sync  
✅ Scheduled background tasks  
✅ Full CRUD operations  
✅ Authentication & authorization  
✅ Vue 3 frontend with routing  
✅ TypeScript for type safety  
✅ Responsive UI design  
✅ Real-time data updates  
✅ CORS-enabled API  

**Status:** Production Ready 🚀
