# DocEasy - Online Medical Consultation Platform

DocEasy is a comprehensive telemedicine platform that connects patients with verified doctors for online consultations. The platform supports video calls, chat consultations, appointment scheduling, and secure payment processing.

## 🌟 Features

### For Patients
- **User Registration & Authentication** - Secure signup with email verification (OTP)
- **Find Doctors** - Browse and search verified doctors by specialty
- **Book Appointments** - Schedule video or chat consultations
- **Multiple Consultation Types** - Video calls, chat, and phone consultations
- **Secure Payments** - Integrated payment processing for consultation fees
- **Medical History** - Maintain and share medical records with doctors
- **Appointment Management** - View, reschedule, or cancel appointments
- **Real-time Notifications** - Get updates on appointment status

### For Doctors
- **Professional Registration** - Multi-step verification process
- **Profile Management** - Showcase qualifications, experience, and specialties
- **Appointment Management** - Accept/reject appointment requests
- **Patient Dashboard** - View patient history and consultation records
- **Video Consultations** - Conduct secure video calls with patients
- **Chat Consultations** - Text-based consultations with patients
- **Availability Management** - Set consultation hours and availability
- **Document Upload** - Upload credentials and certifications

### For Administrators
- **Dashboard Analytics** - Monitor platform statistics and metrics
- **Doctor Verification** - Review and approve doctor registrations
- **User Management** - Manage patients and doctors
- **Complaint Handling** - Review and resolve user complaints
- **System Settings** - Configure platform settings
- **Notification System** - Send announcements and updates

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **UI Library**: Shadcn/ui (Radix UI components)
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Real-time Communication**: WebRTC for video calls
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend
- **Framework**: Flask 2.0
- **Database**: MongoDB (MongoDB Atlas for production)
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Flask-Mail
- **Password Hashing**: Werkzeug
- **CORS**: Flask-CORS
- **Server**: Gunicorn (production)

## 📁 Project Structure

```
doceasy/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   │   ├── dashboard/   # Dashboard pages (Patient, Doctor, Admin)
│   │   │   └── login/       # Login pages for different roles
│   │   ├── services/        # API service layer
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
│
├── backend/                 # Flask backend application
│   ├── app.py              # Main Flask application
│   ├── models.py           # MongoDB models
│   ├── routes.py           # API route handlers
│   ├── email_utils.py      # Email sending utilities
│   ├── database.py         # Database configuration
│   ├── mongodb_config.py   # MongoDB connection setup
│   ├── uploads/            # File upload directory
│   └── requirements.txt    # Python dependencies
│
└── render.yaml             # Render deployment configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MongoDB (local or MongoDB Atlas account)
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file with the following variables:
```env
# Database
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=doceasy

# Security
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ACCESS_TOKEN_EXPIRES=168

# Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER=DocEasy <your_email@gmail.com>

# Frontend URL
FRONTEND_URL=http://localhost:8080

# Admin Credentials
DEFAULT_ADMIN_EMAIL=admin@doceasy.com
DEFAULT_ADMIN_PASSWORD=your_admin_password

# Server Configuration
HOST=0.0.0.0
PORT=5000
FLASK_ENV=development
FLASK_DEBUG=True
```

6. Start the backend server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:8080`

## 🔐 Default Admin Credentials

After the first run, a default admin account is created:
- **Email**: subrahmanyag79@gmail.com
- **Password**: Subbu@2004

⚠️ **Important**: Change these credentials in production!

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new patient/doctor
- `POST /login` - Login for all user types
- `POST /verify-otp` - Verify email OTP
- `POST /resend-otp` - Resend verification OTP
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /refresh-token` - Refresh JWT token
- `GET /validate-session` - Validate current session

### Admin (`/api/admin`)
- `GET /dashboard/stats` - Dashboard statistics
- `GET /profile` - Admin profile
- `GET /doctors` - List all doctors
- `GET /doctors/pending-verification` - Pending doctor verifications
- `PUT /doctors/:id/verify` - Approve/reject doctor
- `DELETE /doctors/:id` - Remove doctor
- `GET /patients` - List all patients
- `GET /complaints` - List all complaints
- `PUT /complaints/:id/status` - Update complaint status
- `GET /notifications` - Get notifications
- `PUT /notifications/:id/read` - Mark notification as read

### Doctor (`/api/doctor`)
- `POST /profile` - Create/update doctor profile
- `GET /profile` - Get doctor profile
- `GET /appointments` - Get doctor appointments
- `PUT /appointments/:id/status` - Update appointment status
- `GET /patients` - Get doctor's patients
- `GET /dashboard/stats` - Doctor dashboard stats

### Patient (`/api/patient`)
- `GET /profile` - Get patient profile
- `PUT /profile` - Update patient profile
- `GET /appointments` - Get patient appointments
- `POST /appointments` - Book new appointment
- `GET /doctors` - List approved doctors

### Payments (`/api/payments`)
- `POST /create-order` - Create payment order
- `POST /verify` - Verify payment
- `GET /history` - Payment history

## 🎨 Key Features Implementation

### Email Verification
- OTP-based email verification for new registrations
- 10-minute OTP expiration
- Resend OTP functionality
- Welcome emails after successful verification

### Doctor Verification Workflow
1. Doctor registers with email and password
2. Email verification via OTP
3. Complete profile with credentials and documents
4. Admin reviews and approves/rejects
5. Notification sent to doctor about verification status

### Appointment System
- Multiple consultation types (video, chat, phone)
- Real-time status updates (pending, confirmed, completed, cancelled)
- Google Meet integration for video calls
- Rejection reason tracking
- Appointment history for patients and doctors

### Payment Integration
- Secure payment processing
- Consultation fee management
- Payment history tracking
- Automatic appointment confirmation after payment

### Real-time Communication
- WebRTC-based video consultations
- Chat messaging system
- Notification system for appointment updates

## 🌐 Deployment

### Render Deployment

The project is configured for deployment on Render with the included `render.yaml` file.

#### Backend Deployment
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure environment variables
4. Deploy using:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`

#### Frontend Deployment
1. Create a new Static Site on Render
2. Configure:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
3. Set environment variable: `VITE_API_URL=your_backend_url`

### Environment Variables for Production

**Backend**:
- Set `FLASK_ENV=production`
- Set `FLASK_DEBUG=False`
- Use strong `SECRET_KEY` and `JWT_SECRET_KEY`
- Configure MongoDB Atlas URI
- Set proper `FRONTEND_URL`
- Configure email credentials

**Frontend**:
- Set `VITE_API_URL` to production backend URL

## 🔒 Security Features

- JWT-based authentication with token expiration
- Password hashing using Werkzeug
- Email verification for new accounts
- Role-based access control (Admin, Doctor, Patient)
- Secure file upload with validation
- CORS configuration
- Password reset with secure tokens
- Session validation and refresh

## 📱 User Roles & Permissions

### Patient
- Register and manage profile
- Search and view doctors
- Book appointments
- Make payments
- Join video/chat consultations
- View appointment history

### Doctor
- Register with credentials
- Complete professional profile
- Manage appointments
- Conduct consultations
- View patient records
- Set availability

### Admin
- Verify doctor registrations
- Manage users
- Handle complaints
- View analytics
- System configuration
- Send notifications

## 🐛 Development

### Running Tests
```bash
# Frontend
cd frontend
npm run lint

# Backend
cd backend
python -m pytest
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build

# Backend uses gunicorn in production
```

## 📄 License

This project is proprietary software.

## 👥 Contributors

- Development Team: DocEasy

## 📞 Support

For support, email: doceasy4@gmail.com

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - User authentication and registration
  - Doctor verification system
  - Appointment booking
  - Video and chat consultations
  - Payment integration
  - Admin dashboard

---

**Note**: This is a production application. Ensure all environment variables are properly configured and secure before deployment.
