# VirtualDoc Backend API

Production-ready backend API for the VirtualDoc application, providing comprehensive user authentication, health data management, and real-time consultation features with StreamChat integration.

## 🚀 Features

- **User Authentication**: JWT-based secure authentication with bcrypt password hashing
- **Health Data Management**: Complete patient profile and medical history management
- **Real-time Chat**: StreamChat integration for patient-doctor consultations
- **MongoDB Integration**: Robust database connectivity with connection pooling
- **CORS Protection**: Production-ready CORS configuration
- **Security Headers**: Comprehensive security middleware
- **Multi-language Support**: Internationalization ready
- **Production Optimized**: Environment-based configuration and error handling

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- StreamChat account (optional, for chat features)
- Vercel account (for deployment)

## 🛠️ Installation

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/Nathan-Richard-21/virtualdoc-backend.git
cd virtualdoc-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Setup:**
```bash
cp .env.example .env
# Edit .env with your configuration values
```

4. **Start development server:**
```bash
npm run dev
```

The server will start on `http://localhost:5001`

### Production Deployment (Vercel)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Nathan-Richard-21/virtualdoc-backend.git
git push -u origin main
```

2. **Deploy to Vercel:**
   - Import project from GitHub in Vercel dashboard
   - Configure environment variables in Vercel
   - Deploy automatically

3. **Required Environment Variables for Production:**
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
STREAM_CHAT_API_KEY=your_stream_api_key
STREAM_CHAT_API_SECRET=your_stream_api_secret
NODE_ENV=production
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - User login  
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### StreamChat Integration
- `POST /api/stream-token` - Generate chat authentication token
- `POST /api/create-channel` - Create consultation channel
- `GET /api/stream-health` - StreamChat service status

### Health & Monitoring
- `GET /api/health` - API health check
- `GET /api/test-db` - Database connection test
- `GET /` - API information and documentation

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5001 |
| `NODE_ENV` | Environment mode | Yes | development |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `STREAM_CHAT_API_KEY` | StreamChat API key | No | - |
| `STREAM_CHAT_API_SECRET` | StreamChat API secret | No | - |

### CORS Configuration

The API is configured to accept requests from:
- `http://localhost:5173` (Development)
- `https://virtual-doc-smoky.vercel.app` (Production)
- `https://virtual-doc.vercel.app` (Production)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Origin-based request filtering
- **Security Headers**: XSS, content type, and frame protection
- **Input Validation**: Request data validation and sanitization
- **Environment Variables**: Secure configuration management

## 📊 Database Schema

### User Model
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String,
  dateOfBirth: Date,
  gender: String (enum),
  bloodType: String (enum),
  height: String,
  weight: String,
  address: Object,
  emergencyContact: Object,
  medicalHistory: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚨 Error Handling

The API includes comprehensive error handling:
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource not found)
- **500**: Internal Server Error (server issues)

## 🧪 Testing

### Health Check
```bash
curl https://your-api-domain.vercel.app/api/health
```

### Database Connection
```bash
curl https://your-api-domain.vercel.app/api/test-db
```

## 📈 Monitoring

Monitor your deployment:
- Vercel dashboard for deployment logs
- MongoDB Atlas for database metrics
- StreamChat dashboard for chat analytics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: nathan.richard.dev@gmail.com

## 🔗 Related Projects

- [VirtualDoc Frontend](https://github.com/Nathan-Richard-21/virtual-doc)
- [VirtualDoc Documentation](https://virtual-doc-smoky.vercel.app/api)
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