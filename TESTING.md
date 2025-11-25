# Testing Guide for DocEasy

Comprehensive testing guide for the DocEasy platform.

## 🧪 Testing Strategy

### Testing Levels
1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - API endpoints and database operations
3. **End-to-End Tests** - Complete user workflows
4. **Manual Testing** - UI/UX and edge cases

## 🔧 Setup Testing Environment

### Backend Testing Setup

```bash
cd backend

# Install testing dependencies
pip install pytest pytest-cov pytest-flask

# Create test configuration
cp .env .env.test
```

### Frontend Testing Setup

```bash
cd frontend

# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

## 📝 Test Cases

### 1. Authentication Tests

#### 1.1 Patient Registration
```
Test: Register new patient
Steps:
1. POST /api/auth/register with valid patient data
2. Verify 201 status code
3. Verify OTP email sent
4. Verify user_id returned
5. Verify user not yet active

Expected: Registration successful, OTP sent
```

#### 1.2 Email Verification
```
Test: Verify email with OTP
Steps:
1. POST /api/auth/verify-otp with user_id and correct OTP
2. Verify 200 status code
3. Verify access_token returned
4. Verify user is now active

Expected: Email verified, token received
```

#### 1.3 Login
```
Test: Login with valid credentials
Steps:
1. POST /api/auth/login with email and password
2. Verify 200 status code
3. Verify access_token returned
4. Verify user object contains correct role

Expected: Login successful, token received
```

#### 1.4 Password Reset
```
Test: Complete password reset flow
Steps:
1. POST /api/auth/forgot-password with email
2. Verify reset email sent
3. POST /api/auth/reset-password with token and new password
4. Verify password changed
5. Login with new password

Expected: Password reset successful
```

### 2. Doctor Workflow Tests

#### 2.1 Doctor Registration
```
Test: Complete doctor registration workflow
Steps:
1. POST /api/auth/register with role=doctor
2. Verify OTP with /api/auth/verify-otp
3. POST /api/doctor/profile with credentials
4. Verify status is "admin_pending"

Expected: Doctor registered, awaiting admin approval
```

#### 2.2 Doctor Verification
```
Test: Admin verifies doctor
Steps:
1. Admin login
2. GET /api/admin/doctors/pending-verification
3. PUT /api/admin/doctors/:id/verify with approved=true
4. Verify doctor status is "approved"
5. Verify email sent to doctor

Expected: Doctor approved, can now receive appointments
```

#### 2.3 Doctor Profile Management
```
Test: Doctor updates profile
Steps:
1. Doctor login
2. GET /api/doctor/profile
3. PUT /api/doctor/profile with updated data
4. Verify changes saved

Expected: Profile updated successfully
```

### 3. Appointment Tests

#### 3.1 Book Appointment
```
Test: Patient books appointment
Steps:
1. Patient login
2. GET /api/doctors to find available doctor
3. POST /api/patient/appointments with appointment details
4. Verify appointment created with status "pending"
5. Verify doctor receives notification

Expected: Appointment booked successfully
```

#### 3.2 Confirm Appointment
```
Test: Doctor confirms appointment
Steps:
1. Doctor login
2. GET /api/doctor/appointments?status=pending
3. PUT /api/doctor/appointments/:id/status with status="confirmed"
4. Verify patient receives notification

Expected: Appointment confirmed
```

#### 3.3 Reject Appointment
```
Test: Doctor rejects appointment
Steps:
1. Doctor login
2. PUT /api/doctor/appointments/:id/status with status="rejected"
3. Include rejection_reason
4. Verify patient receives notification with reason

Expected: Appointment rejected with reason
```

### 4. Payment Tests

#### 4.1 Create Payment Order
```
Test: Create payment for appointment
Steps:
1. Patient login
2. POST /api/payments/create-order with appointment_id
3. Verify order_id returned
4. Verify payment record created

Expected: Payment order created
```

#### 4.2 Verify Payment
```
Test: Verify payment completion
Steps:
1. POST /api/payments/verify with payment details
2. Verify appointment status updated to "confirmed"
3. Verify payment status is "completed"

Expected: Payment verified, appointment confirmed
```

### 5. Admin Dashboard Tests

#### 5.1 Dashboard Statistics
```
Test: Get admin dashboard stats
Steps:
1. Admin login
2. GET /api/admin/dashboard/stats
3. Verify all statistics returned
4. Verify counts are accurate

Expected: Dashboard stats retrieved
```

#### 5.2 Manage Patients
```
Test: Admin manages patient status
Steps:
1. Admin login
2. GET /api/admin/patients
3. PUT /api/admin/patients/:id/status with new status
4. Verify status updated

Expected: Patient status updated
```

#### 5.3 Handle Complaints
```
Test: Admin handles complaint
Steps:
1. Admin login
2. GET /api/admin/complaints
3. PUT /api/admin/complaints/:id/status with resolution
4. Verify complaint status updated
5. Verify admin notes saved

Expected: Complaint resolved
```

## 🔍 Manual Testing Checklist

### Patient Flow
- [ ] Register new patient account
- [ ] Verify email with OTP
- [ ] Login to patient dashboard
- [ ] Browse available doctors
- [ ] Search doctors by specialty
- [ ] View doctor details
- [ ] Book video consultation
- [ ] Book chat consultation
- [ ] Make payment
- [ ] Join video call
- [ ] Send chat messages
- [ ] View appointment history
- [ ] Update profile
- [ ] Change password
- [ ] Logout

### Doctor Flow
- [ ] Register doctor account
- [ ] Verify email with OTP
- [ ] Complete profile with credentials
- [ ] Upload documents (license, certificates)
- [ ] Wait for admin verification
- [ ] Login after approval
- [ ] View pending appointments
- [ ] Accept appointment
- [ ] Reject appointment with reason
- [ ] View today's appointments
- [ ] Join video consultation
- [ ] Respond to chat consultation
- [ ] View patient history
- [ ] Update availability
- [ ] View earnings
- [ ] Update profile
- [ ] Logout

### Admin Flow
- [ ] Login to admin dashboard
- [ ] View dashboard statistics
- [ ] Review pending doctor verifications
- [ ] View doctor credentials
- [ ] Approve doctor
- [ ] Reject doctor
- [ ] View all patients
- [ ] Update patient status
- [ ] View all appointments
- [ ] View complaints
- [ ] Resolve complaints
- [ ] View notifications
- [ ] Mark notifications as read
- [ ] View payment history
- [ ] Release payments to doctors
- [ ] Update system settings
- [ ] Logout

## 🐛 Bug Testing

### Edge Cases to Test

#### Authentication
- [ ] Register with existing email
- [ ] Login with wrong password
- [ ] Login before email verification
- [ ] Use expired OTP
- [ ] Use expired reset token
- [ ] Access protected route without token
- [ ] Access protected route with expired token

#### Appointments
- [ ] Book appointment in the past
- [ ] Book overlapping appointments
- [ ] Cancel confirmed appointment
- [ ] Join video call before appointment time
- [ ] Access another user's appointment

#### Payments
- [ ] Make payment with insufficient funds
- [ ] Verify payment with wrong signature
- [ ] Double payment for same appointment
- [ ] Refund cancelled appointment

#### File Uploads
- [ ] Upload file larger than 5MB
- [ ] Upload invalid file type
- [ ] Upload malicious file
- [ ] Upload without authentication

## 🚀 Performance Testing

### Load Testing Scenarios

#### 1. Concurrent Logins
```
Test: 100 concurrent login requests
Expected: All requests complete within 5 seconds
```

#### 2. Appointment Booking
```
Test: 50 concurrent appointment bookings
Expected: No double bookings, all requests processed
```

#### 3. Video Call Connections
```
Test: 20 simultaneous video calls
Expected: All connections stable, no dropped calls
```

### Performance Benchmarks

| Endpoint | Expected Response Time |
|----------|----------------------|
| GET /api/doctors | < 500ms |
| POST /api/auth/login | < 1s |
| POST /api/appointments | < 2s |
| GET /api/admin/dashboard/stats | < 1s |

## 🔒 Security Testing

### Security Test Cases

#### 1. SQL/NoSQL Injection
```
Test: Attempt injection in login
Input: email: "admin@test.com' OR '1'='1"
Expected: Request rejected, no unauthorized access
```

#### 2. XSS Attack
```
Test: Inject script in profile fields
Input: name: "<script>alert('XSS')</script>"
Expected: Script sanitized, not executed
```

#### 3. CSRF Attack
```
Test: Submit form without CSRF token
Expected: Request rejected
```

#### 4. Brute Force
```
Test: 10 failed login attempts
Expected: Account locked or rate limited
```

#### 5. Token Manipulation
```
Test: Modify JWT token payload
Expected: Token validation fails
```

## 📊 Test Coverage Goals

- **Backend**: 80%+ code coverage
- **Frontend**: 70%+ component coverage
- **API Endpoints**: 100% endpoint coverage
- **Critical Paths**: 100% coverage

## 🛠️ Testing Tools

### Backend
- **pytest**: Unit and integration tests
- **pytest-cov**: Code coverage
- **pytest-flask**: Flask testing utilities
- **Postman**: API testing

### Frontend
- **Vitest**: Unit tests
- **React Testing Library**: Component tests
- **Cypress**: E2E tests (optional)
- **Jest**: Test runner

### Performance
- **Apache JMeter**: Load testing
- **Lighthouse**: Performance auditing
- **WebPageTest**: Performance analysis

## 📝 Test Reporting

### Generate Test Reports

#### Backend
```bash
cd backend
pytest --cov=. --cov-report=html
# Open htmlcov/index.html
```

#### Frontend
```bash
cd frontend
npm run test -- --coverage
# Open coverage/index.html
```

## 🔄 Continuous Testing

### Pre-commit Checks
```bash
# Run before every commit
npm run lint
npm run test
```

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run backend tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest
      - name: Run frontend tests
        run: |
          cd frontend
          npm install
          npm test
```

## 🎯 Testing Checklist

Before deployment:
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Manual testing completed
- [ ] Security tests passed
- [ ] Performance benchmarks met
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness tested
- [ ] Error handling verified
- [ ] Edge cases covered
- [ ] Documentation updated

---

**Last Updated**: January 2025
**Version**: 1.0.0
