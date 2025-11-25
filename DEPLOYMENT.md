# DocEasy Deployment Guide

Complete guide for deploying DocEasy to production on Render.

## 📋 Pre-Deployment Checklist

### Backend
- [ ] MongoDB Atlas cluster created and accessible
- [ ] Environment variables configured
- [ ] Strong JWT_SECRET_KEY and SECRET_KEY generated
- [ ] Email service (Gmail) configured with app password
- [ ] CORS origins updated for production frontend URL
- [ ] Default admin credentials changed

### Frontend
- [ ] API_URL updated to production backend URL
- [ ] Environment variables configured
- [ ] Build tested locally (`npm run build`)
- [ ] All routes working correctly

## 🚀 Deployment Steps

### 1. MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (Free tier is sufficient for testing)
3. Create a database user with read/write permissions
4. Whitelist IP addresses (0.0.0.0/0 for Render or specific IPs)
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```

### 2. Backend Deployment on Render

#### Step 1: Create Web Service

1. Go to https://render.com and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `doceasy-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `master` or `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`

#### Step 2: Configure Environment Variables

Add these environment variables in Render dashboard:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=doceasy

# Security (GENERATE NEW SECURE KEYS!)
SECRET_KEY=<generate-strong-random-key>
JWT_SECRET_KEY=<generate-strong-random-key>
JWT_ACCESS_TOKEN_EXPIRES=168

# Flask
FLASK_ENV=production
FLASK_DEBUG=False

# Email
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=DocEasy <your-email@gmail.com>

# Admin
DEFAULT_ADMIN_EMAIL=admin@doceasy.com
DEFAULT_ADMIN_PASSWORD=<strong-password>

# CORS (Update after frontend deployment)
CORS_ORIGIN=https://your-frontend-url.onrender.com

# Frontend URL (Update after frontend deployment)
FRONTEND_URL=https://your-frontend-url.onrender.com

# Server
HOST=0.0.0.0
PORT=5000
```

#### Step 3: Generate Secure Keys

Use Python to generate secure keys:

```python
import secrets
print("SECRET_KEY:", secrets.token_urlsafe(32))
print("JWT_SECRET_KEY:", secrets.token_urlsafe(32))
```

Or use online tools like: https://randomkeygen.com/

#### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete (5-10 minutes)
3. Note your backend URL: `https://your-service-name.onrender.com`
4. Test health endpoint: `https://your-service-name.onrender.com/health`

### 3. Frontend Deployment on Render

#### Step 1: Create Static Site

1. In Render dashboard, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `doceasy-frontend` (or your preferred name)
   - **Region**: Same as backend
   - **Branch**: `master` or `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

#### Step 2: Configure Environment Variables

Add these environment variables:

```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_APP_NAME=DocEasy
VITE_DEV_MODE=false
```

#### Step 3: Deploy

1. Click "Create Static Site"
2. Wait for deployment (5-10 minutes)
3. Note your frontend URL: `https://your-frontend-name.onrender.com`

### 4. Update CORS Configuration

After frontend deployment:

1. Go to backend service in Render
2. Update environment variables:
   - `CORS_ORIGIN`: Add your frontend URL
   - `FRONTEND_URL`: Add your frontend URL
3. Trigger manual deploy to apply changes

### 5. Configure Custom Domain (Optional)

#### For Backend:
1. In Render dashboard, go to your backend service
2. Click "Settings" → "Custom Domain"
3. Add your domain (e.g., `api.doceasy.com`)
4. Update DNS records as instructed

#### For Frontend:
1. In Render dashboard, go to your frontend service
2. Click "Settings" → "Custom Domain"
3. Add your domain (e.g., `doceasy.com` or `www.doceasy.com`)
4. Update DNS records as instructed

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files to Git
- ✅ Use strong, unique keys for production
- ✅ Rotate keys periodically
- ✅ Use different keys for development and production

### 2. Database Security
- ✅ Use strong database passwords
- ✅ Restrict IP access in MongoDB Atlas
- ✅ Enable MongoDB authentication
- ✅ Regular backups

### 3. Email Security
- ✅ Use Gmail App Passwords (not regular password)
- ✅ Enable 2FA on email account
- ✅ Monitor email sending limits

### 4. Application Security
- ✅ Keep dependencies updated
- ✅ Use HTTPS only (Render provides this automatically)
- ✅ Implement rate limiting
- ✅ Validate all user inputs
- ✅ Sanitize database queries

## 📊 Monitoring & Maintenance

### Health Checks

Backend health endpoint:
```
GET https://your-backend-url.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "mongodb_uri": "mongodb+srv://...",
  "jwt_expiry_hours": 168
}
```

### Logs

Access logs in Render dashboard:
1. Go to your service
2. Click "Logs" tab
3. Monitor for errors and warnings

### Performance Monitoring

- Monitor response times in Render dashboard
- Check database performance in MongoDB Atlas
- Set up alerts for downtime

## 🔄 Continuous Deployment

Render automatically deploys when you push to your connected branch:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin master
   ```
3. Render automatically detects changes and deploys

### Manual Deployment

If needed, trigger manual deployment:
1. Go to service in Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Failed**
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Check database user permissions

**Email Not Sending**
- Verify Gmail App Password
- Check MAIL_USERNAME and MAIL_PASSWORD
- Ensure 2FA is enabled on Gmail account

**CORS Errors**
- Verify CORS_ORIGIN includes frontend URL
- Check for trailing slashes in URLs
- Ensure protocol (https://) is included

### Frontend Issues

**API Calls Failing**
- Verify VITE_API_URL is correct
- Check backend is running and healthy
- Inspect browser console for errors

**Build Failures**
- Check Node.js version compatibility
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall

**Routing Issues**
- Ensure all routes are defined in App.tsx
- Check for typos in route paths
- Verify React Router configuration

## 📱 Testing Production Deployment

### Backend Tests

```bash
# Health check
curl https://your-backend-url.onrender.com/health

# Login test
curl -X POST https://your-backend-url.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@doceasy.com","password":"your-password"}'

# Get doctors (public endpoint)
curl https://your-backend-url.onrender.com/api/doctors
```

### Frontend Tests

1. Open frontend URL in browser
2. Test user flows:
   - Patient registration and login
   - Doctor registration and verification
   - Admin login and dashboard
   - Appointment booking
   - Video call functionality

## 🔐 Post-Deployment Security

1. **Change Default Credentials**
   ```bash
   # Login as admin and change password immediately
   ```

2. **Enable Rate Limiting** (if not already enabled)
   - Implement in Flask app
   - Use Render's built-in DDoS protection

3. **Set Up Monitoring**
   - Configure uptime monitoring (UptimeRobot, Pingdom)
   - Set up error tracking (Sentry)
   - Enable email alerts for downtime

4. **Regular Updates**
   - Update dependencies monthly
   - Monitor security advisories
   - Apply patches promptly

## 📈 Scaling Considerations

### Free Tier Limitations (Render)
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free (sufficient for 1 service)

### Upgrading for Production
- **Starter Plan** ($7/month): No spin-down, better performance
- **Standard Plan** ($25/month): More resources, better for production
- Consider upgrading both frontend and backend

### Database Scaling
- MongoDB Atlas Free Tier: 512MB storage
- Upgrade to M2 ($9/month) or higher for production
- Enable automatic backups

## 🎯 Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Strong passwords and keys in use
- [ ] CORS properly configured
- [ ] Email service working
- [ ] Database backups enabled
- [ ] Health checks passing
- [ ] All user flows tested
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team trained on deployment process

## 📞 Support

For deployment issues:
- Render Documentation: https://render.com/docs
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- DocEasy Issues: Create an issue in the GitHub repository

---

**Last Updated**: January 2025
**Version**: 1.0.0
