# DocEasy API Documentation

Complete API reference for the DocEasy telemedicine platform.

## Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://doceasy-bcd3.onrender.com`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "data": {},
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "error_type": "error_type_code"
}
```

## API Endpoints

### 1. Authentication (`/api/auth`)

#### 1.1 Register Patient

**Endpoint**: `POST /api/auth/register`

**Description**: Register a new patient account

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "phoneNumber": "+1234567890",
  "gender": "male",
  "dateOfBirth": "1990-01-15"
}
```

**Response** (201 Created):
```json
{
  "message": "Registration successful. Please check your email for verification code.",
  "user_id": "507f1f77bcf86cd799439011",
  "requires_verification": true,
  "dev_otp": "123456"
}
```

#### 1.2 Register Doctor

**Endpoint**: `POST /api/auth/register`

**Description**: Register a new doctor account (Step 1: Email registration)

**Request Body**:
```json
{
  "email": "dr.smith@example.com",
  "password": "SecurePass123",
  "role": "doctor"
}
```

**Response** (201 Created):
```json
{
  "message": "Registration successful. Please check your email for verification code.",
  "user_id": "507f1f77bcf86cd799439012",
  "requires_verification": true
}
```

#### 1.3 Verify OTP

**Endpoint**: `POST /api/auth/verify-otp`

**Description**: Verify email with OTP code

**Request Body**:
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "otp": "123456"
}
```

**Response** (200 OK):
```json
{
  "message": "Email verified successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "patient"
  }
}
```

#### 1.4 Resend OTP

**Endpoint**: `POST /api/auth/resend-otp`

**Description**: Resend OTP verification code

**Request Body**:
```json
{
  "user_id": "507f1f77bcf86cd799439011"
}
```

**Response** (200 OK):
```json
{
  "message": "New verification code sent to your email",
  "dev_otp": "654321"
}
```

#### 1.5 Login

**Endpoint**: `POST /api/auth/login`

**Description**: Login for all user types (patient, doctor, admin)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "patient"
  }
}
```

**Doctor Response** (includes additional fields):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "email": "dr.smith@example.com",
    "name": "Dr. Smith",
    "role": "doctor",
    "verificationStatus": "approved",
    "profileCompleted": true
  }
}
```

#### 1.6 Forgot Password

**Endpoint**: `POST /api/auth/forgot-password`

**Description**: Request password reset email

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "If an account with that email exists, we have sent password reset instructions."
}
```

#### 1.7 Reset Password

**Endpoint**: `POST /api/auth/reset-password`

**Description**: Reset password using reset token

**Request Body**:
```json
{
  "email": "user@example.com",
  "reset_token": "abc123def456...",
  "new_password": "NewSecurePass123"
}
```

**Response** (200 OK):
```json
{
  "message": "Password has been reset successfully. You can now log in with your new password.",
  "success": true
}
```

#### 1.8 Verify Reset Token

**Endpoint**: `POST /api/auth/verify-reset-token`

**Description**: Verify if reset token is valid

**Request Body**:
```json
{
  "email": "user@example.com",
  "reset_token": "abc123def456..."
}
```

**Response** (200 OK):
```json
{
  "valid": true,
  "user_role": "patient",
  "message": "Reset token is valid"
}
```

#### 1.9 Refresh Token

**Endpoint**: `POST /api/auth/refresh-token`

**Description**: Refresh JWT token to extend session

**Headers**:
```
Authorization: Bearer <expired_or_expiring_token>
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "patient"
  },
  "message": "Token refreshed successfully"
}
```

#### 1.10 Validate Session

**Endpoint**: `GET /api/auth/validate-session`

**Description**: Validate current session

**Headers**:
```
Authorization: Bearer <your_jwt_token>
```

**Response** (200 OK):
```json
{
  "valid": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "patient"
  },
  "expires_at": 1704067200
}
```

---

### 2. Admin Endpoints (`/api/admin`)

All admin endpoints require admin authentication.

#### 2.1 Dashboard Statistics

**Endpoint**: `GET /api/admin/dashboard/stats`

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Response** (200 OK):
```json
{
  "totalDoctors": 45,
  "pendingVerifications": 5,
  "totalPatients": 320,
  "totalComplaints": 12,
  "newComplaints": 3,
  "newDoctorsThisMonth": 8,
  "newPatientsThisMonth": 42,
  "highPriorityComplaints": 2
}
```

#### 2.2 Get All Doctors

**Endpoint**: `GET /api/admin/doctors`

**Response** (200 OK):
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Dr. John Smith",
    "email": "dr.smith@example.com",
    "specialty": "Cardiology",
    "verificationStatus": "approved",
    "experience_years": 10,
    "consultationFee": 500,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### 2.3 Get Pending Verification Doctors

**Endpoint**: `GET /api/admin/doctors/pending-verification`

**Response** (200 OK):
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "name": "Dr. Jane Doe",
    "email": "dr.doe@example.com",
    "specialty": "Pediatrics",
    "verificationStatus": "admin_pending",
    "documents": ["medical_license.pdf", "mbbs_certificate.pdf"],
    "created_at": "2024-01-20T14:20:00Z"
  }
]
```

#### 2.4 Verify/Reject Doctor

**Endpoint**: `PUT /api/admin/doctors/:doctor_id/verify`

**Request Body**:
```json
{
  "approved": true
}
```

**Response** (200 OK):
```json
{
  "message": "Doctor has been approved successfully",
  "success": true
}
```

#### 2.5 Remove Doctor

**Endpoint**: `DELETE /api/admin/doctors/:doctor_id`

**Response** (200 OK):
```json
{
  "message": "Doctor removed successfully"
}
```

#### 2.6 Get All Patients

**Endpoint**: `GET /api/admin/patients`

**Response** (200 OK):
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "status": "active",
    "consultations": 5,
    "registrationDate": "2024-01-10T09:15:00Z"
  }
]
```

#### 2.7 Update Patient Status

**Endpoint**: `PUT /api/admin/patients/:patient_id/status`

**Request Body**:
```json
{
  "status": "active"
}
```

**Response** (200 OK):
```json
{
  "message": "Patient status updated successfully"
}
```

#### 2.8 Get All Complaints

**Endpoint**: `GET /api/admin/complaints`

**Response** (200 OK):
```json
[
  {
    "id": "507f1f77bcf86cd799439020",
    "patientName": "John Doe",
    "doctorName": "Dr. Smith",
    "description": "Long wait time for consultation",
    "severity": "medium",
    "status": "new",
    "date": "2024-01-22T16:45:00Z"
  }
]
```

#### 2.9 Update Complaint Status

**Endpoint**: `PUT /api/admin/complaints/:complaint_id/status`

**Request Body**:
```json
{
  "status": "resolved",
  "notes": "Issue has been addressed with the doctor"
}
```

**Response** (200 OK):
```json
{
  "message": "Complaint status updated successfully"
}
```

#### 2.10 Get Notifications

**Endpoint**: `GET /api/admin/notifications`

**Response** (200 OK):
```json
[
  {
    "id": "507f1f77bcf86cd799439030",
    "title": "New Doctor Registration",
    "message": "Dr. Jane Doe has registered and needs verification",
    "type": "info",
    "read": false,
    "date": "2024-01-22",
    "time": "14:30"
  }
]
```

#### 2.11 Mark Notification as Read

**Endpoint**: `PUT /api/admin/notifications/:notification_id/read`

**Response** (200 OK):
```json
{
  "message": "Notification marked as read"
}
```

#### 2.12 Mark All Notifications as Read

**Endpoint**: `PUT /api/admin/notifications/read-all`

**Response** (200 OK):
```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

---

### 3. Doctor Endpoints (`/api/doctor`)

All doctor endpoints require doctor authentication.

#### 3.1 Create/Update Profile

**Endpoint**: `POST /api/doctor/profile`

**Description**: Complete doctor profile after email verification

**Headers**:
```
Authorization: Bearer <doctor_jwt_token>
Content-Type: multipart/form-data
```

**Form Data**:
```
firstName: John
lastName: Smith
phoneNumber: +1234567890
specialty: Cardiology
experienceYears: 10
consultationFee: 500
chatConsultationFee: 300
bio: Experienced cardiologist...
languages: ["English", "Spanish"]
qualifications: ["MBBS", "MD"]
clinicAddress: 123 Medical St, City
medical_license: <file>
mbbs_certificate: <file>
profile_picture: <file>
```

**Response** (200 OK):
```json
{
  "message": "Profile created successfully",
  "doctor": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Dr. John Smith",
    "specialty": "Cardiology",
    "verificationStatus": "admin_pending"
  }
}
```

#### 3.2 Get Doctor Profile

**Endpoint**: `GET /api/doctor/profile`

**Response** (200 OK):
```json
{
  "id": "507f1f77bcf86cd799439012",
  "name": "Dr. John Smith",
  "email": "dr.smith@example.com",
  "specialty": "Cardiology",
  "experience_years": 10,
  "consultationFee": 500,
  "chatConsultationFee": 300,
  "bio": "Experienced cardiologist...",
  "verificationStatus": "approved",
  "profileCompleted": true
}
```

#### 3.3 Get Doctor Appointments

**Endpoint**: `GET /api/doctor/appointments`

**Query Parameters**:
- `status` (optional): Filter by status (pending, confirmed, completed)
- `date` (optional): Filter by date (YYYY-MM-DD)

**Response** (200 OK):
```json
[
  {
    "id": "507f1f77bcf86cd799439040",
    "patient_name": "John Doe",
    "patient_email": "john.doe@example.com",
    "appointment_date": "2024-01-25T10:00:00Z",
    "consultation_type": "video",
    "status": "confirmed",
    "reason": "Chest pain consultation"
  }
]
```

#### 3.4 Update Appointment Status

**Endpoint**: `PUT /api/doctor/appointments/:appointment_id/status`

**Request Body**:
```json
{
  "status": "confirmed",
  "rejection_reason": ""
}
```

**Response** (200 OK):
```json
{
  "message": "Appointment status updated successfully"
}
```

#### 3.5 Get Doctor's Patients

**Endpoint**: `GET /api/doctor/patients`

**Response** (200 OK):
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "lastVisit": "2024-01-20T14:30:00Z",
    "totalConsultations": 3
  }
]
```

#### 3.6 Get Dashboard Stats

**Endpoint**: `GET /api/doctor/dashboard/stats`

**Response** (200 OK):
```json
{
  "totalPatients": 45,
  "todayAppointments": 5,
  "pendingAppointments": 3,
  "completedConsultations": 120,
  "totalEarnings": 60000
}
```

---

### 4. Patient Endpoints (`/api/patient`)

All patient endpoints require patient authentication.

#### 4.1 Get Patient Profile

**Endpoint**: `GET /api/patient/profile`

**Response** (200 OK):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "gender": "male",
  "dateOfBirth": "1990-01-15",
  "consultations": 5
}
```

#### 4.2 Update Patient Profile

**Endpoint**: `PUT /api/patient/profile`

**Request Body**:
```json
{
  "phone": "+1234567890",
  "address": "123 Main St, City"
}
```

**Response** (200 OK):
```json
{
  "message": "Profile updated successfully"
}
```

#### 4.3 Get Patient Appointments

**Endpoint**: `GET /api/patient/appointments`

**Response** (200 OK):
```json
[
  {
    "id": "507f1f77bcf86cd799439040",
    "doctor_name": "Dr. John Smith",
    "doctor_specialty": "Cardiology",
    "appointment_date": "2024-01-25T10:00:00Z",
    "consultation_type": "video",
    "status": "confirmed",
    "google_meet_link": "https://meet.google.com/abc-defg-hij"
  }
]
```

#### 4.4 Book Appointment

**Endpoint**: `POST /api/patient/appointments`

**Request Body**:
```json
{
  "doctor_id": "507f1f77bcf86cd799439012",
  "appointment_date": "2024-01-25T10:00:00Z",
  "appointment_time": "10:00 AM",
  "consultation_type": "video",
  "reason": "Chest pain consultation",
  "medical_history": "Previous heart condition",
  "urgent": false
}
```

**Response** (201 Created):
```json
{
  "message": "Appointment booked successfully",
  "appointment": {
    "id": "507f1f77bcf86cd799439040",
    "status": "pending",
    "payment_required": true
  }
}
```

---

### 5. Public Endpoints (`/api`)

#### 5.1 Get All Approved Doctors

**Endpoint**: `GET /api/doctors`

**Description**: Get list of all approved doctors (public endpoint)

**Response** (200 OK):
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Dr. John Smith",
    "specialty": "Cardiology",
    "experience_years": 10,
    "consultation_fee": 500,
    "bio": "Experienced cardiologist...",
    "profile_picture": "/uploads/profile_pictures/dr_smith.jpg"
  }
]
```

#### 5.2 Get Doctor Details

**Endpoint**: `GET /api/doctors/:doctor_id`

**Response** (200 OK):
```json
{
  "id": "507f1f77bcf86cd799439012",
  "name": "Dr. John Smith",
  "specialty": "Cardiology",
  "experience_years": 10,
  "consultation_fee": 500,
  "chatConsultationFee": 300,
  "bio": "Experienced cardiologist...",
  "languages": ["English", "Spanish"],
  "qualifications": ["MBBS", "MD"],
  "clinic_address": "123 Medical St, City"
}
```

---

### 6. Payment Endpoints (`/api/payments`)

#### 6.1 Create Payment Order

**Endpoint**: `POST /api/payments/create-order`

**Request Body**:
```json
{
  "appointment_id": "507f1f77bcf86cd799439040",
  "amount": 500,
  "currency": "INR"
}
```

**Response** (200 OK):
```json
{
  "order_id": "order_abc123",
  "amount": 500,
  "currency": "INR",
  "payment_id": "507f1f77bcf86cd799439050"
}
```

#### 6.2 Verify Payment

**Endpoint**: `POST /api/payments/verify`

**Request Body**:
```json
{
  "payment_id": "507f1f77bcf86cd799439050",
  "order_id": "order_abc123",
  "signature": "payment_signature_hash"
}
```

**Response** (200 OK):
```json
{
  "message": "Payment verified successfully",
  "appointment_confirmed": true
}
```

#### 6.3 Get Payment History

**Endpoint**: `GET /api/payments/history`

**Response** (200 OK):
```json
[
  {
    "id": "507f1f77bcf86cd799439050",
    "appointment_id": "507f1f77bcf86cd799439040",
    "amount": 500,
    "currency": "INR",
    "status": "completed",
    "payment_date": "2024-01-22T15:30:00Z"
  }
]
```

---

### 7. Health Check

#### 7.1 Health Check

**Endpoint**: `GET /health`

**Description**: Check API health and database connection

**Response** (200 OK):
```json
{
  "status": "healthy",
  "database": "connected",
  "mongodb_uri": "mongodb+srv://...",
  "jwt_expiry_hours": 168
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Database connection issue |

## Rate Limiting

- **Default**: 200 requests per day, 50 per hour
- **Login**: 5 attempts per minute
- **OTP**: 3 requests per 10 minutes

## Token Expiration

- **JWT Token**: 7 days (168 hours)
- **OTP**: 10 minutes
- **Password Reset Token**: 1 hour

---

**Last Updated**: January 2025
**API Version**: 1.0.0
