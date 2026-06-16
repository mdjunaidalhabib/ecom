# GlorixBD SaaS — সম্পূর্ণ Setup গাইড

## এখন কীভাবে কাজ করবে

```
Super Admin Panel এ "New Tenant" ক্লিক
         ↓
① Master DB তে Tenant record তৈরি
② MongoDB তে নতুন DB তৈরি + seed:
     - Admin user (email + auto password)  
     - Navbar, Footer, DeliveryCharge default data
③ Nginx এ subdomain কনফিগ (wildcard দিয়ে অটো)
         ↓
Client পায়:
  shop1.glorixbd.com         → Frontend (শপিং সাইট)
  shop1.glorixbd.com/admin   → Admin Panel (তার DB)
  
  Login credentials:
  Email:    ownerEmail (যেটা SA দিয়েছে)
  Password: auto-generated (response এ দেখায়)
```

---

## VPS এ কী কী চলবে

| Service | Port | PM2 Name |
|---------|------|----------|
| Existing Backend (API) | 4000 | glorixbd-backend |
| Existing Frontend | 3000 | glorixbd-frontend |
| Existing Admin Panel | 3012 | glorixbd-admin |
| **Super Admin Backend** | **5001** | **sa-backend** |
| **Super Admin Panel** | **3001** | **sa-panel** |

---

## ধাপ ১: ফাইল আপলোড

```bash
# Local থেকে
scp -r saas-complete/ user@your-vps:/var/www/glorixbd/

# VPS তে
cd /var/www/glorixbd/saas-complete
```

---

## ধাপ ২: .env তৈরি

```bash
cd super-admin-backend
cp .env.example .env
nano .env
```

```env
MASTER_MONGO_URI=mongodb://localhost:27017
MASTER_DB_NAME=glorixbd_master
MONGO_BASE_URI=mongodb://localhost:27017

SA_JWT_SECRET=লম্বা_গোপন_key_এখানে_দাও
SA_PORT=5001

SA_NAME=Super Admin
SA_EMAIL=superadmin@glorixbd.com
SA_PASSWORD=শক্তিশালী_পাসওয়ার্ড

SA_PANEL_URL=https://superadmin.glorixbd.com
ROOT_DOMAIN=glorixbd.com

TENANT_FRONTEND_PORT=3000
ADMIN_PORT=3012

NODE_ENV=production
```

---

## ধাপ ৩: Setup Script রান করো

```bash
chmod +x /var/www/glorixbd/saas-complete/scripts/setup.sh
sudo bash /var/www/glorixbd/saas-complete/scripts/setup.sh
```

---

## ধাপ ৪: Backend Server.js ম্যানুয়াল Patch

`/var/www/glorixbd/Glorixbd-main/backend/server.js` খোলো।

**উপরে import এ যোগ করো:**
```javascript
import { resolveTenant } from "./src/middlewares/tenantMiddleware.js";
```

**`app.use(cors(...))` এর পরে যোগ করো:**
```javascript
app.use(resolveTenant);
```

**backend/.env এ যোগ করো:**
```env
MONGO_BASE_URI=mongodb://localhost:27017
ROOT_DOMAIN=glorixbd.com
```

**তারপর restart:**
```bash
pm2 restart glorixbd-backend
```

---

## ধাপ ৫: DNS Setup (Cloudflare/Domain Panel)

```
A Record:  glorixbd.com        → YOUR_VPS_IP
A Record:  *.glorixbd.com      → YOUR_VPS_IP   ← এটা সবচেয়ে গুরুত্বপূর্ণ
A Record:  superadmin.glorixbd.com → YOUR_VPS_IP
A Record:  api-sa.glorixbd.com → YOUR_VPS_IP
```

Wildcard `*` record থাকলে সব subdomain অটো কাজ করবে।

---

## ধাপ ৬: Wildcard SSL

```bash
sudo certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d "glorixbd.com" \
  -d "*.glorixbd.com"
```

DNS TXT record যোগ করতে বলবে — Cloudflare তে যোগ করো।
তারপর:
```bash
sudo certbot --nginx -d "glorixbd.com" -d "*.glorixbd.com"
sudo systemctl reload nginx
```

---

## ব্যবহার করার নিয়ম

### নতুন Client তৈরি করতে:
1. `https://superadmin.glorixbd.com` লগইন করো
2. Tenants → New Tenant ক্লিক করো
3. তথ্য দাও (Shop Name, Owner Email, Subdomain, Plan)
4. "Create Tenant" ক্লিক করো

### Response এ পাবে:
```json
{
  "message": "Tenant created & provisioning started",
  "credentials": {
    "email": "client@gmail.com",
    "password": "abc123def456",
    "adminUrl": "https://shop1.glorixbd.com/admin"
  }
}
```

এই credentials client কে দাও।

### Client এর Admin Panel:
- URL: `https://shop1.glorixbd.com/admin`
- Email + Password: উপরে যা পেয়েছ

---

## সমস্যা হলে

```bash
# সব process দেখো
pm2 list

# Backend log
pm2 logs glorixbd-backend

# Super Admin log
pm2 logs sa-backend

# Nginx log
sudo tail -f /var/log/nginx/error.log

# MongoDB check
mongosh --eval "show dbs"
```

---

## আর্কিটেকচার সংক্ষেপ

```
DNS: *.glorixbd.com → VPS IP
       ↓
Nginx (Wildcard)
       ↓ Host: shop1.glorixbd.com
       ↓
Frontend (port 3000)   → tenant-config API → Master DB → shop1 config load
Backend  (port 4000)   → tenantMiddleware  → Master DB → shop1 DB connect
Admin    (port 3012)   → tenantMiddleware  → Master DB → shop1 DB connect
```
