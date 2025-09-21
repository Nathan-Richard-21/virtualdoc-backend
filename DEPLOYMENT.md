# VirtualDoc Backend Deployment Guide

This guide will help you deploy the VirtualDoc backend to Vercel for production use.

## 📋 Pre-deployment Checklist

### 1. Required Accounts & Services
- ✅ GitHub account
- ✅ Vercel account
- ✅ MongoDB Atlas account
- ✅ StreamChat account (optional, for chat features)

### 2. Environment Variables Setup
Prepare the following environment variables for production:

```env
# Required
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters-long
NODE_ENV=production

# Optional (for StreamChat features)
STREAM_CHAT_API_KEY=your_stream_chat_api_key
STREAM_CHAT_API_SECRET=your_stream_chat_api_secret
```

## 🚀 Deployment Steps

### Step 1: Initialize Git Repository

Navigate to the backend directory and run:

```bash
cd backend
git init
git add .
git commit -m "Initial commit: VirtualDoc Backend for production deployment"
git branch -M main
git remote add origin https://github.com/Nathan-Richard-21/virtualdoc-backend.git
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# ? Set up and deploy "~/path/to/backend"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Vercel username]
# ? Link to existing project? [y/N] n
# ? What's your project's name? virtualdoc-backend
# ? In which directory is your code located? ./
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub: `https://github.com/Nathan-Richard-21/virtualdoc-backend`
4. Configure project settings:
   - **Project Name**: `virtualdoc-backend`
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### Step 3: Configure Environment Variables in Vercel

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | Your MongoDB connection string | Production |
| `JWT_SECRET` | Your secure JWT secret | Production |
| `NODE_ENV` | `production` | Production |
| `STREAM_CHAT_API_KEY` | Your StreamChat API key | Production |
| `STREAM_CHAT_API_SECRET` | Your StreamChat API secret | Production |

### Step 4: Verify Deployment

After deployment, test your API:

```bash
# Health check
curl https://virtualdoc-backend.vercel.app/api/health

# Database connection test
curl https://virtualdoc-backend.vercel.app/api/test-db

# API information
curl https://virtualdoc-backend.vercel.app/
```

### Step 5: Update Frontend Configuration

The frontend API configuration has been updated to use:
- Development: `http://localhost:5001`
- Production: `https://virtualdoc-backend.vercel.app`

## 🔧 Post-Deployment Configuration

### Update CORS Origins
If you have a custom domain for your frontend, update the CORS configuration in `server.js`:

```javascript
const allowedOrigins = [
  // Development
  'http://localhost:5173',
  'http://localhost:5174', 
  'http://localhost:3000',
  'http://localhost:3001',
  // Production - Add your custom domains here
  'https://virtual-doc-smoky.vercel.app',
  'https://virtual-doc.vercel.app',
  'https://your-custom-domain.com',  // Add your domain
  'https://www.your-custom-domain.com'  // Add www version
];
```

### MongoDB Atlas Network Access
Ensure MongoDB Atlas allows Vercel's IP addresses:
1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
3. Or add Vercel's specific IP ranges if you prefer restricted access

## 🧪 Testing Your Deployment

### 1. API Health Check
```bash
curl https://virtualdoc-backend.vercel.app/api/health
```
Expected response:
```json
{
  "status": "OK",
  "message": "Doctor Web API is running",
  "timestamp": "2025-09-21T..."
}
```

### 2. Database Connection Test
```bash
curl https://virtualdoc-backend.vercel.app/api/test-db
```
Expected response:
```json
{
  "database": "connected",
  "message": "Database connected successfully"
}
```

### 3. StreamChat Health Check
```bash
curl https://virtualdoc-backend.vercel.app/api/stream-health
```
Expected response:
```json
{
  "streamChatEnabled": true,
  "apiKey": "configured",
  "status": "ready"
}
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Fails**
   - Check MONGODB_URI environment variable
   - Verify MongoDB Atlas network access settings
   - Ensure database user has correct permissions

2. **CORS Errors**
   - Verify frontend domain is in allowedOrigins array
   - Check if environment variables are set correctly
   - Ensure frontend is using the correct backend URL

3. **JWT Token Issues**
   - Verify JWT_SECRET is set and matches between deployments
   - Check token expiration settings
   - Ensure proper token format in frontend requests

4. **StreamChat Not Working**
   - Verify STREAM_CHAT_API_KEY and STREAM_CHAT_API_SECRET are set
   - Check StreamChat dashboard for API usage
   - Ensure StreamChat client is properly initialized

### Debugging Commands

```bash
# Check deployment logs
vercel logs https://virtualdoc-backend.vercel.app

# Check environment variables (be careful with secrets)
vercel env ls

# Redeploy
vercel --prod
```

## 📈 Monitoring

Monitor your production deployment:

1. **Vercel Dashboard**: Monitor deployment status, logs, and analytics
2. **MongoDB Atlas**: Monitor database performance and usage
3. **StreamChat Dashboard**: Monitor chat usage and performance

## 🔄 Future Updates

To update your backend:

```bash
# Make your changes
git add .
git commit -m "Update: description of changes"
git push origin main

# Vercel will automatically deploy the changes
```

## 🔗 Important URLs

After deployment, save these URLs:

- **API Base URL**: `https://virtualdoc-backend.vercel.app`
- **Health Check**: `https://virtualdoc-backend.vercel.app/api/health`
- **API Documentation**: `https://virtualdoc-backend.vercel.app/`
- **Vercel Dashboard**: `https://vercel.com/dashboard`

## ✅ Deployment Complete!

Your VirtualDoc backend is now ready for production use! 🎉

The backend includes:
- ✅ User authentication with JWT
- ✅ Health data management
- ✅ StreamChat integration for consultations
- ✅ Production-ready security headers
- ✅ MongoDB Atlas integration
- ✅ CORS configuration for your frontend
- ✅ Comprehensive error handling
- ✅ Health monitoring endpoints