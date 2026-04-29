# ☁️ BlogCloud — Lightweight Blog Hosting Platform

> A full-stack, cloud-powered blog hosting platform built as a **college mini project** demonstrating real-world cloud computing concepts using Next.js 14, MongoDB Atlas, AWS S3, CloudFront CDN, and modern web technologies.

---

## 📌 Project Overview

BlogCloud is a production-grade blog hosting platform where users can write, publish, and discover blog posts. Every layer of the application uses cloud services to demonstrate scalability, reliability, and performance.

### 🎯 Learning Objectives
- Cloud storage with AWS S3
- Content delivery networks with CloudFront
- Managed cloud databases with MongoDB Atlas
- Serverless deployment on Vercel
- JWT-based authentication
- RESTful API design

---

## 🛠 Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | Next.js 14 (App Router)             |
| Styling        | Tailwind CSS + shadcn/ui            |
| State Mgmt     | Redux Toolkit                       |
| Auth           | NextAuth.js (JWT + Google OAuth)    |
| Backend API    | Next.js API Routes                  |
| Database       | MongoDB Atlas (Mongoose ORM)        |
| Image Storage  | AWS S3                              |
| CDN            | AWS CloudFront                      |
| Deployment     | Vercel / AWS EC2                    |
| Forms          | React Hook Form + Zod               |
| Editor         | Custom Markdown Editor              |
| Charts         | Recharts                            |

---

## ☁️ Cloud Computing Concepts Demonstrated

### 1. AWS S3 — Object Storage
- Blog cover images uploaded directly to S3
- Pre-signed URLs for secure browser-to-S3 direct uploads
- Server-side upload fallback
- Object deletion when posts are removed
- Organized folder structure (`blogs/`, `avatars/`)

### 2. AWS CloudFront — CDN
- All S3 images served through CloudFront edge locations
- Global low-latency image delivery
- Cache-Control headers for long-lived assets
- CDN URL displayed on images to show cloud origin

### 3. MongoDB Atlas — Cloud Database
- Fully managed NoSQL cloud database
- Automatic backups and point-in-time recovery
- Optimized indexes for text search, author queries, category queries
- Connection pooling for serverless environments

### 4. Vercel / AWS EC2 — Deployment
- One-click Vercel deployment with automatic CI/CD
- Environment variable management
- EC2 deployment guide included

### 5. Security
- JWT tokens via NextAuth.js
- Password hashing with bcrypt (12 rounds)
- Protected API routes with session validation
- Role-based access control (user / admin)
- Input validation with Zod on all endpoints

---

## 📂 Project Structure

```
blog-platform/
├── app/
│   ├── api/                      # API Routes (backend)
│   │   ├── auth/
│   │   │   ├── [...nextauth]/    # NextAuth handler
│   │   │   └── register/        # User registration
│   │   ├── blogs/               # CRUD for blog posts
│   │   │   └── [slug]/          # Single blog operations
│   │   ├── comments/            # Comments CRUD
│   │   ├── likes/[blogId]/      # Like toggle
│   │   ├── categories/          # Category management
│   │   ├── search/              # Full-text search
│   │   ├── upload/              # AWS S3 upload
│   │   ├── users/[id]/          # User profile CRUD
│   │   ├── admin/
│   │   │   ├── analytics/       # Platform analytics
│   │   │   └── users/           # User management
│   │   └── notifications/       # User notifications
│   ├── (auth)/                  # Auth pages (login, register)
│   ├── (public)/                # Public pages
│   │   ├── blogs/               # Blog listing
│   │   ├── blog/[slug]/         # Blog detail
│   │   ├── search/              # Search results
│   │   └── author/[id]/         # Author profile
│   ├── dashboard/               # User dashboard
│   │   ├── blogs/               # My blogs, create, edit
│   │   ├── profile/             # Profile settings
│   │   └── notifications/       # Notifications
│   ├── admin/                   # Admin panel
│   │   ├── page.tsx             # Analytics dashboard
│   │   ├── users/               # User management
│   │   └── blogs/               # Blog management
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/
│   ├── auth/                    # AuthProvider
│   ├── blog/                    # BlogCard, BlogDetailClient, MarkdownEditor, ImageUpload
│   ├── dashboard/               # CreateEditBlog
│   ├── layout/                  # Navbar, Footer
│   └── shared/                  # ThemeProvider
├── lib/
│   ├── mongodb.ts               # DB connection with connection pooling
│   ├── auth.ts                  # NextAuth config
│   └── s3.ts                    # AWS S3 utilities
├── models/
│   ├── User.ts                  # User schema
│   ├── Blog.ts                  # Blog schema
│   └── index.ts                 # Comment, Like, Category, Notification schemas
├── redux/
│   ├── store.ts                 # Redux store
│   ├── Provider.tsx             # Redux provider
│   └── slices/
│       ├── authSlice.ts
│       ├── blogSlice.ts
│       ├── uiSlice.ts
│       └── notificationSlice.ts
├── utils/
│   └── helpers.ts               # Utility functions
├── .env.example                 # Environment variable template
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## 🗄 MongoDB Collections

### users
```js
{ name, email, password (hashed), avatar, bio, role: ['user','admin'],
  isVerified, provider, socialLinks, postsCount, followersCount }
```

### blogs
```js
{ title, slug (unique), excerpt, content (markdown), coverImage (S3 URL),
  coverImageKey (for deletion), author (ref), category (ref), tags[], 
  status: ['draft','published','archived'], featured, views, likesCount,
  commentsCount, readTime, seo: {metaTitle, metaDescription}, publishedAt }
```

### comments
```js
{ blog (ref), author (ref), content, parentComment (for replies), likes }
```

### likes
```js
{ user (ref), blog (ref) }  // unique compound index
```

### categories
```js
{ name, slug, description, color (hex), icon (emoji), postsCount }
```

### notifications
```js
{ recipient, sender, type: ['like','comment','follow','reply'],
  blog (ref), message, isRead }
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- AWS account (S3 + CloudFront)

### 1. Clone & Install
```bash
git clone <repo-url>
cd blog-platform
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Fill in all required values
```

### 3. Setup MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user with read/write permissions
3. Whitelist your IP (or use 0.0.0.0/0 for development)
4. Copy the connection string to `MONGODB_URI`

### 4. Setup AWS S3
```bash
# Create an S3 bucket
# Bucket name → set in AWS_S3_BUCKET_NAME
# Region      → set in AWS_REGION

# Bucket Policy (allow public read for CloudFront):
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
  }]
}

# CORS Configuration:
[{
  "AllowedOrigins": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"]
}]
```

### 5. Setup CloudFront
1. Create a CloudFront distribution
2. Origin = your S3 bucket
3. Allow HTTP methods: GET, HEAD
4. Copy the distribution domain to `NEXT_PUBLIC_CLOUDFRONT_URL`

### 6. Create IAM User (AWS)
```bash
# In AWS IAM, create a user with these permissions:
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"],
  "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
}
# Save Access Key ID and Secret → AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
```

### 7. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## 🌍 Deployment

### Option A — Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod

# Add environment variables in Vercel dashboard:
# Project → Settings → Environment Variables
```

### Option B — AWS EC2
```bash
# 1. Launch EC2 instance (Ubuntu 22.04, t2.micro for free tier)
# 2. Install dependencies
sudo apt update && sudo apt install -y nodejs npm nginx

# 3. Clone and build
git clone <repo> && cd blog-platform
npm install && npm run build

# 4. Use PM2 for process management
npm install -g pm2
pm2 start npm --name "blogcloud" -- start
pm2 save && pm2 startup

# 5. Configure Nginx reverse proxy
# /etc/nginx/sites-available/blogcloud:
server {
    listen 80;
    server_name your-domain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📋 API Reference

| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| GET    | /api/blogs                  | No   | List published blogs     |
| POST   | /api/blogs                  | Yes  | Create blog post         |
| GET    | /api/blogs/:slug            | No   | Get single blog + views  |
| PATCH  | /api/blogs/:slug            | Yes  | Update blog              |
| DELETE | /api/blogs/:slug            | Yes  | Delete blog + S3 image   |
| GET    | /api/search?q=...           | No   | Full-text search         |
| POST   | /api/comments               | Yes  | Post comment/reply       |
| GET    | /api/comments?blogId=...    | No   | Get blog comments        |
| POST   | /api/likes/:blogId          | Yes  | Toggle like              |
| GET    | /api/upload                 | Yes  | Get pre-signed S3 URL    |
| POST   | /api/upload                 | Yes  | Upload image to S3       |
| GET    | /api/categories             | No   | List categories          |
| GET    | /api/users/:id              | No   | Get user profile         |
| PATCH  | /api/users/:id              | Yes  | Update profile           |
| GET    | /api/admin/analytics        | Admin| Platform analytics       |
| GET    | /api/admin/users            | Admin| List all users           |
| PATCH  | /api/admin/users            | Admin| Update user role         |
| DELETE | /api/admin/users            | Admin| Delete user              |

---

## 🔐 Default Admin Setup

After registering your first account, promote it to admin via MongoDB Atlas:

```javascript
// In MongoDB Atlas → Browse Collections → users
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin", isVerified: true } }
)
```

---

## ✨ Features Checklist

- [x] User registration & login (email + Google OAuth)
- [x] JWT-based session management
- [x] Create, edit, delete blog posts
- [x] Markdown editor with toolbar
- [x] AWS S3 image upload with pre-signed URLs
- [x] CloudFront CDN for image delivery
- [x] Like and comment on posts (with replies)
- [x] Full-text search by title/content/tags
- [x] Filter by category and tags
- [x] Author public profile page
- [x] User dashboard with analytics
- [x] Admin panel with user management
- [x] Platform-wide analytics charts (Recharts)
- [x] Dark/light theme toggle
- [x] SEO metadata per post
- [x] Responsive design (mobile-first)
- [x] Notification system
- [x] Draft saving

---

## 👥 Team / Credits

Built as a **Cloud Computing Mini Project** for college coursework.

**Stack credits:** Next.js, MongoDB Atlas, AWS, NextAuth.js, Redux Toolkit, Tailwind CSS, shadcn/ui, Recharts, React Hook Form, Zod.
