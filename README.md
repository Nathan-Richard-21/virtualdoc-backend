# Doctor Web - MERN Stack Backend

This is the backend API for the Doctor Web application, providing user authentication and health data management.

## Features

- User authentication (signup/login) with JWT tokens
- Password hashing with bcrypt
- MongoDB integration for user data storage
- Health information management
- Multi-language support
- CORS enabled for frontend integration

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (connection string provided)
- npm or yarn package manager

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already configured in `.env` file with the MongoDB connection string.

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Health
- `GET /api/health` - Health check endpoint
- `GET /api/test-db` - Test database connection

## User Schema

The user model includes the following fields:

### Basic Information
- firstName, lastName
- email (unique)
- password (hashed)
- phone
- dateOfBirth
- gender

### Address Information
- street, city, state, zipCode, country

### Medical Information
- allergies (array)
- medications (array)
- conditions (array)
- surgeries (array with procedure, date, hospital)

### Emergency Contact
- name, relationship, phone

### Insurance Information
- provider, policyNumber, groupNumber

### Preferences
- preferredLanguage (en, xh, ts)

## Database Connection

The application connects to MongoDB Atlas using the provided connection string:
```
mongodb+srv://nrchinoz49_db_user:cc8Ajtg8IUb3baW1@clusterdoc.xa5fxvx.mongodb.net/doctorweb
```

## Security Features

- Passwords are hashed using bcrypt with salt rounds of 12
- JWT tokens expire after 7 days
- CORS configured for frontend domain
- Input validation and sanitization
- Protected routes require valid JWT tokens

## Development Commands

```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
```

## Frontend Integration

The backend is configured to work with the React frontend running on `http://localhost:5173`. The frontend can make API calls to authenticate users and manage health data.

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://nrchinoz49_db_user:cc8Ajtg8IUb3baW1@clusterdoc.xa5fxvx.mongodb.net/doctorweb?retryWrites=true&w=majority&appName=Clusterdoc
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-environment-make-it-very-long-and-complex
FRONTEND_URL=http://localhost:5173
```