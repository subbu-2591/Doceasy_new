# Production Deployment Checklist

Complete checklist for deploying DocEasy to production.

## 📋 Pre-Deployment Checklist

### 1. Environment Setup

#### Backend Environment Variables
- [ ] `MONGODB_URI` - MongoDB Atlas connection string configured
- [ ] `MONGODB_DB_NAME` - Database name set to `doceasy`
- [ ] `JWT_SECRET_KEY` - Strong random key generated (32+ characters)
- [ ] `SECRET_KEY` - Strong random key generated (32+ characters)
- [ ] `JWT_ACCESS_TOKEN_EXPIRES` - Set to 168 (7 days)
- [ ] `FLASK_ENV` - Set to `production`
- [ ] `FLASK_DEBUG` - Set to `False`
- [ ] `MAIL_SERVER` - Set to `smtp.gmail.com`
- [ ] `MAIL_PORT` - Set to `587`
- [ ] `MAIL_USE_TLS` - Set to `True`
- [ ] `MAIL_USERNAME` - Gmail address configured
- [ ] `MAIL_PASSWORD` - Gmail App Password configured
- [ ] `MAIL_DEFAULT_SENDER` - Sender email configured
- [ ] `DEFAULT_ADMIN_EMAIL` - Admin email set
- [ ] `DEFAULT_ADMIN_PASSWORD` - Strong admin password set
- [ ] `FRONTEND_URL` - Production frontend URL configured
- [ ] `CORS_ORIGIN` - Production frontend URL added
- [ ] `HOST` - Set to `0.0.0.0`
- [ ] `PORT` - Set to `5000` or Render's `$PORT`

#### Frontend Environment Variables
- [ ] `VITE_API_URL` - Production backend URL configured
- [ ] `VITE_APP_NAME` - Set to `DocEasy`
- [ ] `VITE_DEV_MODE` - Set to `false`

### 2. Security Configuration

#### Passwords & Keys
- [ ] Changed default admin password
- [ ] Generated strong JWT_SECRET_KEY
- [ ] Generated strong SECRET_KEY
- [ ] Gmail App Password created (not regular password)
- [ ] All sensitive data removed from code

#### Database Security
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Database user created with appropriate permissions
- [ ] Connection string uses SSL/TLS
- [ ] Automatic backups enabled in MongoDB Atlas

#### Application Security
- [ ] CORS restricted to production domain only
- [ ] HTTPS enforced (Render provides this)
- [ ] Security headers configured
- [ ] File upload restrictions in place
- [ ] Input validation implemented
- [ ] Error messages don't expose sensitive info

### 3. Code Quality

#### Backend
- [ ] All routes tested
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] No debug code in production
- [ ] Requirements.txt up to date
- [ ] No hardcoded credentials

#### Frontend
- [ ] All components tested
- [ ] No console.log statements in production
- [ ] Error boundaries implemented
- [ ] Loading states handled
- [ ] Package.json dependencies updated
- [ ] Build tested locally (`npm run build`)

### 4. Database Setup

#### MongoDB Atlas
- [ ] Cluster created and running
- [ ] Database user created
- [ ] IP whitelist configured (0.0.0.0/0 for Render)
- [ ] Connection string tested
- [ ] Indexes created for performance
- [ ] Backup schedule configured

#### Collections
- [ ] `admins` collection will be auto-created
- [ ] `doctors` collection will be auto-created
- [ ] `patients` collection will be auto-created
- [ ] `appointments` collection will be auto-created
- [ ] `payments` collection will be auto-created
- [ ] `complaints` collection will be auto-created
- [ ] `notifications` collection will be auto-created

### 5. Email Service

#### Gmail Configuration
- [ ] 2-Factor Authentication enabled
- [ ] App Password generated
- [ ] Test email sent successfully
- [ ] Email templates reviewed
- [ ] Sender email verified

### 6. Testing

#### Functional Testing
- [ ] Patient registration flow tested
- [ ] Doctor registration flow tested
- [ ] Admin login tested
- [ ] OTP verification tested
- [ ] Password reset tested
- [ ] Appointment booking tested
- [ ] Payment flow tested
- [ ] Video call tested
- [ ] Chat consultation tested

#### Security Testing
- [ ] SQL/NoSQL injection tested
- [ ] XSS attack tested
- [ ] CSRF protection verified
- [ ] Authentication bypass tested
- [ ] Authorization tested
- [ ] File upload security tested

#### Performance Testing
- [ ] Load testing completed
- [ ] Response times acceptable
- [ ] Database queries optimized
- [ ] Frontend bundle size optimized

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Render

1. **Create Web Service**
   - [ ] Logged into Render dashboard
   - [ ] Created new Web Service
   - [ ] Connected GitHub repository
   - [ ] Selected `master` branch
   - [ ] Set root directory to `backend`

2. **Configure Build Settings**
   - [ ] Runtime: Python 3
   - [ ] Build Command: `pip install -r requirements.txt`
   - [ ] Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`

3. **Add Environment Variables**
   - [ ] All backend environment variables added
   - [ ] Sensitive values not committed to Git
   - [ ] Values verified for correctness

4. **Deploy**
   - [ ] Clicked "Create Web Service"
   - [ ] Deployment completed successfully
   - [ ] Backend URL noted: `https://_____.onrender.com`

5. **Verify Backend**
   - [ ] Health check endpoint working: `/health`
   - [ ] API responding correctly
   - [ ] Database connection successful
   - [ ] Logs checked for errors

### Step 2: Deploy Frontend to Render

1. **Create Static Site**
   - [ ] Created new Static Site
   - [ ] Connected GitHub repository
   - [ ] Selected `master` branch
   - [ ] Set root directory to `frontend`

2. **Configure Build Settings**
   - [ ] Build Command: `npm install && npm run build`
   - [ ] Publish Directory: `dist`

3. **Add Environment Variables**
   - [ ] `VITE_API_URL` set to backend URL
   - [ ] Other frontend variables added

4. **Configure Routing**
   - [ ] SPA routing configured
   - [ ] Rewrite rules added for React Router

5. **Deploy**
   - [ ] Clicked "Create Static Site"
   - [ ] Deployment completed successfully
   - [ ] Frontend URL noted: `https://_____.onrender.com`

6. **Verify Frontend**
   - [ ] Website loads correctly
   - [ ] All pages accessible
   - [ ] API calls working
   - [ ] No console errors

### Step 3: Update CORS Configuration

1. **Update Backend Environment**
   - [ ] Added frontend URL to `CORS_ORIGIN`
   - [ ] Updated `FRONTEND_URL` variable
   - [ ] Triggered manual deploy

2. **Verify CORS**
   - [ ] Frontend can make API calls
   - [ ] No CORS errors in console
   - [ ] Authentication working

### Step 4: Final Configuration

1. **Email Links**
   - [ ] Email templates use correct frontend URL
   - [ ] Password reset links working
   - [ ] OTP emails being sent

2. **Admin Account**
   - [ ] Default admin account created
   - [ ] Admin can login
   - [ ] Admin password changed from default

3. **Test Complete Flows**
   - [ ] Patient registration → verification → login
   - [ ] Doctor registration → verification → profile → approval
   - [ ] Admin login → verify doctor → manage users
   - [ ] Book appointment → payment → consultation

## 📊 Post-Deployment Verification

### Health Checks

#### Backend Health
```bash
curl https://your-backend-url.onrender.com/health
```
Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "jwt_expiry_hours": 168
}
```

#### Frontend Health
- [ ] Homepage loads
- [ ] All routes accessible
- [ ] Images loading
- [ ] Styles applied correctly

### Functionality Tests

#### Authentication
- [ ] Patient can register
- [ ] OTP email received
- [ ] Email verification works
- [ ] Login successful
- [ ] Token refresh working
- [ ] Logout working

#### Doctor Workflow
- [ ] Doctor can register
- [ ] Email verification works
- [ ] Profile creation works
- [ ] Documents upload successfully
- [ ] Admin receives notification
- [ ] Admin can approve doctor
- [ ] Doctor receives approval email

#### Appointments
- [ ] Patient can browse doctors
- [ ] Patient can book appointment
- [ ] Doctor receives notification
- [ ] Doctor can accept/reject
- [ ] Patient receives notification
- [ ] Google Meet link generated

#### Payments
- [ ] Payment order created
- [ ] Payment can be completed
- [ ] Payment verification works
- [ ] Appointment confirmed after payment

#### Admin Functions
- [ ] Dashboard loads with stats
- [ ] Can view all doctors
- [ ] Can verify doctors
- [ ] Can view patients
- [ ] Can handle complaints
- [ ] Notifications working

### Performance Checks

- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] No console errors

### Security Checks

- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] CORS properly configured
- [ ] Authentication required for protected routes
- [ ] File uploads restricted
- [ ] No sensitive data in responses

## 🔧 Monitoring Setup

### Error Tracking
- [ ] Error logging configured
- [ ] Log aggregation set up
- [ ] Error alerts configured

### Uptime Monitoring
- [ ] Uptime monitor configured (UptimeRobot, Pingdom)
- [ ] Health check endpoint monitored
- [ ] Alert notifications set up

### Performance Monitoring
- [ ] Response time monitoring
- [ ] Database performance tracking
- [ ] Resource usage monitoring

## 📱 User Acceptance Testing

### Patient Testing
- [ ] 5 test patients created
- [ ] All patient features tested
- [ ] Feedback collected
- [ ] Issues documented

### Doctor Testing
- [ ] 3 test doctors created
- [ ] All doctor features tested
- [ ] Feedback collected
- [ ] Issues documented

### Admin Testing
- [ ] Admin features tested
- [ ] Dashboard verified
- [ ] Management functions tested
- [ ] Issues documented

## 📝 Documentation

- [ ] README.md updated with production URLs
- [ ] API documentation reviewed
- [ ] Deployment guide verified
- [ ] Security guide reviewed
- [ ] User guides created (if needed)

## 🎯 Go-Live Checklist

### Final Checks
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Backups configured
- [ ] Monitoring active
- [ ] Support team ready

### Communication
- [ ] Stakeholders notified
- [ ] Users informed
- [ ] Support documentation ready
- [ ] Rollback plan prepared

### Launch
- [ ] Production URLs shared
- [ ] DNS configured (if custom domain)
- [ ] SSL certificates verified
- [ ] Final smoke test completed
- [ ] Go-live approved

## 🔄 Post-Launch

### Day 1
- [ ] Monitor error logs
- [ ] Check user registrations
- [ ] Verify email delivery
- [ ] Monitor performance
- [ ] Address critical issues

### Week 1
- [ ] Review user feedback
- [ ] Monitor system health
- [ ] Check database performance
- [ ] Review security logs
- [ ] Plan improvements

### Month 1
- [ ] Analyze usage patterns
- [ ] Review performance metrics
- [ ] Update documentation
- [ ] Plan feature enhancements
- [ ] Conduct security audit

## 🚨 Rollback Plan

If critical issues occur:

1. **Immediate Actions**
   - [ ] Identify the issue
   - [ ] Assess impact
   - [ ] Notify stakeholders

2. **Rollback Steps**
   - [ ] Revert to previous deployment
   - [ ] Restore database backup (if needed)
   - [ ] Verify rollback successful
   - [ ] Communicate status

3. **Post-Rollback**
   - [ ] Analyze root cause
   - [ ] Fix issues
   - [ ] Test thoroughly
   - [ ] Plan re-deployment

## ✅ Sign-Off

### Technical Lead
- [ ] All technical requirements met
- [ ] Code quality verified
- [ ] Security measures in place
- [ ] Performance acceptable

**Signed**: _________________ **Date**: _________

### Project Manager
- [ ] All features implemented
- [ ] Documentation complete
- [ ] Testing completed
- [ ] Ready for production

**Signed**: _________________ **Date**: _________

### Security Officer
- [ ] Security audit completed
- [ ] Vulnerabilities addressed
- [ ] Compliance verified
- [ ] Approved for production

**Signed**: _________________ **Date**: _________

---

## 📞 Emergency Contacts

**Technical Issues**: [email/phone]
**Security Issues**: [email/phone]
**Database Issues**: [email/phone]
**General Support**: doceasy4@gmail.com

---

**Checklist Version**: 1.0.0
**Last Updated**: January 2025
**Next Review**: After deployment
