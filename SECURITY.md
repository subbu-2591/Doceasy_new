# Security Guide for DocEasy

This document outlines security best practices and implementation details for the DocEasy platform.

## 🔐 Authentication & Authorization

### JWT Token Management

**Implementation:**
- JWT tokens with 7-day expiration (configurable)
- Secure token storage in localStorage
- Automatic token refresh before expiration
- Token validation on every protected route

**Best Practices:**
```typescript
// Token stored securely
localStorage.setItem('token', token);

// Token included in requests
headers: { Authorization: `Bearer ${token}` }

// Token validation
if (tokenExpiry < currentTime + 300) {
  await refreshToken();
}
```

### Password Security

**Requirements:**
- Minimum 6 characters (increase to 8+ for production)
- Hashed using Werkzeug's `generate_password_hash`
- PBKDF2-SHA256 algorithm with salt

**Implementation:**
```python
from werkzeug.security import generate_password_hash, check_password_hash

# Storing password
hashed = generate_password_hash(password)

# Verifying password
is_valid = check_password_hash(hashed, password)
```

### Role-Based Access Control (RBAC)

**Roles:**
1. **Patient** - Book appointments, view doctors, manage profile
2. **Doctor** - Manage appointments, conduct consultations, view patients
3. **Admin** - Verify doctors, manage users, view analytics

**Implementation:**
```python
@admin_required
def admin_only_route(current_user):
    # Only admins can access
    pass

@doctor_required
def doctor_only_route(current_user):
    # Only doctors can access
    pass
```

## 🛡️ API Security

### CORS Configuration

**Current Setup:**
```python
CORS(app, origins=[
    'http://localhost:5173',
    'http://localhost:8080',
    'https://doceasy-1.onrender.com'
])
```

**Production Recommendations:**
- Restrict to specific domains only
- No wildcard (*) origins
- Include credentials: `supports_credentials=True`

### Rate Limiting

**Recommended Implementation:**
```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.remote_addr,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/auth/login')
@limiter.limit("5 per minute")
def login():
    pass
```

### Input Validation

**Current Implementation:**
- Required field validation
- Email format validation
- File type validation for uploads
- File size limits (5MB)

**Recommendations:**
```python
# Sanitize inputs
from bleach import clean

def sanitize_input(text):
    return clean(text, tags=[], strip=True)

# Validate email
from email_validator import validate_email

def is_valid_email(email):
    try:
        validate_email(email)
        return True
    except:
        return False
```

## 🗄️ Database Security

### MongoDB Security

**Current Setup:**
- MongoDB Atlas with authentication
- Connection string with credentials
- SSL/TLS encryption enabled

**Best Practices:**
1. **Access Control:**
   ```
   - Use strong passwords (20+ characters)
   - Create database-specific users
   - Limit IP whitelist
   - Enable audit logging
   ```

2. **Data Encryption:**
   ```
   - Encryption at rest (Atlas default)
   - Encryption in transit (SSL/TLS)
   - Field-level encryption for sensitive data
   ```

3. **Backup Strategy:**
   ```
   - Enable automatic backups
   - Test restore procedures
   - Keep backups for 30+ days
   ```

### Query Security

**Prevent NoSQL Injection:**
```python
from bson import ObjectId

# Safe query
user = db.users.find_one({'_id': ObjectId(user_id)})

# Unsafe query (avoid)
user = db.users.find_one({'_id': user_id})  # Could be manipulated
```

## 📧 Email Security

### Gmail App Passwords

**Setup:**
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App Passwords
3. Use app password in MAIL_PASSWORD (not regular password)

**Configuration:**
```python
MAIL_SERVER = 'smtp.gmail.com'
MAIL_PORT = 587
MAIL_USE_TLS = True
MAIL_USERNAME = 'your-email@gmail.com'
MAIL_PASSWORD = 'your-app-password'  # 16-character app password
```

### Email Content Security

**Prevent Email Injection:**
```python
import re

def sanitize_email_content(content):
    # Remove potential injection attempts
    content = re.sub(r'[\r\n]+', ' ', content)
    return content
```

## 🔒 File Upload Security

### Current Implementation

```python
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
```

### Enhanced Security

```python
from werkzeug.utils import secure_filename
import magic

def validate_file(file):
    # Secure filename
    filename = secure_filename(file.filename)
    
    # Check file size
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > MAX_FILE_SIZE:
        return False, "File too large"
    
    # Verify file type (not just extension)
    mime = magic.from_buffer(file.read(1024), mime=True)
    file.seek(0)
    
    allowed_mimes = ['application/pdf', 'image/png', 'image/jpeg']
    if mime not in allowed_mimes:
        return False, "Invalid file type"
    
    return True, filename
```

## 🌐 Frontend Security

### XSS Prevention

**React's Built-in Protection:**
- React escapes content by default
- Avoid `dangerouslySetInnerHTML`

**Additional Measures:**
```typescript
import DOMPurify from 'dompurify';

// Sanitize user input before rendering
const cleanHTML = DOMPurify.sanitize(userInput);
```

### CSRF Protection

**Current Implementation:**
- JWT tokens in Authorization header (not cookies)
- SameSite cookie attribute (if using cookies)

**Recommendations:**
```typescript
// Add CSRF token to forms
<input type="hidden" name="csrf_token" value={csrfToken} />
```

### Secure Storage

**Current Implementation:**
```typescript
// Store token in localStorage
localStorage.setItem('token', token);

// Clear on logout
localStorage.removeItem('token');
```

**Considerations:**
- localStorage is vulnerable to XSS
- Consider httpOnly cookies for production
- Implement token rotation

## 🔐 Environment Variables

### Secure Key Generation

**Generate Strong Keys:**
```python
import secrets

# Generate 32-byte (256-bit) keys
SECRET_KEY = secrets.token_urlsafe(32)
JWT_SECRET_KEY = secrets.token_urlsafe(32)
```

**Or use command line:**
```bash
# Linux/Mac
openssl rand -base64 32

# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Environment File Security

**Never commit:**
- `.env` files
- `.env.production` files
- Any file with credentials

**Git Configuration:**
```bash
# .gitignore
.env
.env.local
.env.production
.env.development
*.env
```

## 🚨 Security Headers

### Recommended Headers

```python
from flask import Flask

@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'"
    return response
```

## 📊 Logging & Monitoring

### Security Logging

**Log Security Events:**
```python
import logging

logger = logging.getLogger(__name__)

# Log authentication attempts
logger.info(f"Login attempt for {email}")
logger.warning(f"Failed login attempt for {email}")

# Log authorization failures
logger.warning(f"Unauthorized access attempt to {endpoint}")

# Log suspicious activity
logger.error(f"Potential security breach: {details}")
```

### Monitoring Recommendations

1. **Failed Login Attempts**
   - Track failed logins per IP
   - Implement account lockout after N failures
   - Alert on brute force patterns

2. **API Abuse**
   - Monitor request rates
   - Track unusual patterns
   - Implement rate limiting

3. **Data Access**
   - Log sensitive data access
   - Monitor bulk data exports
   - Track admin actions

## 🔄 Security Updates

### Dependency Management

**Regular Updates:**
```bash
# Backend
pip list --outdated
pip install --upgrade package-name

# Frontend
npm outdated
npm update
```

**Security Audits:**
```bash
# Backend
pip-audit

# Frontend
npm audit
npm audit fix
```

### Update Schedule

- **Critical Security Patches**: Immediately
- **Regular Updates**: Monthly
- **Major Version Updates**: Quarterly (with testing)

## 🎯 Security Checklist

### Pre-Production

- [ ] Change all default passwords
- [ ] Generate strong SECRET_KEY and JWT_SECRET_KEY
- [ ] Configure CORS for production domains only
- [ ] Enable HTTPS (Render provides this)
- [ ] Set up MongoDB IP whitelist
- [ ] Enable MongoDB authentication
- [ ] Use Gmail App Passwords
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Set up logging
- [ ] Configure monitoring
- [ ] Test authentication flows
- [ ] Test authorization rules
- [ ] Validate input sanitization
- [ ] Review file upload security
- [ ] Test password reset flow
- [ ] Verify email security

### Post-Production

- [ ] Monitor logs daily
- [ ] Review access patterns weekly
- [ ] Update dependencies monthly
- [ ] Rotate keys quarterly
- [ ] Conduct security audits annually
- [ ] Test backup restoration
- [ ] Review user permissions
- [ ] Check for vulnerabilities

## 🚨 Incident Response

### Security Breach Protocol

1. **Immediate Actions:**
   - Identify affected systems
   - Isolate compromised components
   - Preserve logs and evidence
   - Notify stakeholders

2. **Investigation:**
   - Analyze logs
   - Identify attack vector
   - Assess damage
   - Document findings

3. **Remediation:**
   - Patch vulnerabilities
   - Reset compromised credentials
   - Update security measures
   - Restore from backups if needed

4. **Post-Incident:**
   - Conduct post-mortem
   - Update security procedures
   - Implement preventive measures
   - Train team on lessons learned

## 📞 Security Contacts

**Report Security Issues:**
- Email: security@doceasy.com
- Create private security advisory on GitHub

**Do Not:**
- Publicly disclose vulnerabilities
- Test attacks on production systems
- Access unauthorized data

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Flask Security Best Practices](https://flask.palletsprojects.com/en/2.3.x/security/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

---

**Last Updated**: January 2025
**Version**: 1.0.0
