const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { StreamChat } = require('stream-chat');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Environment validation
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// StreamChat configuration (optional)
let streamChatClient;
if (process.env.STREAM_CHAT_API_KEY && process.env.STREAM_CHAT_API_SECRET) {
  streamChatClient = StreamChat.getInstance(
    process.env.STREAM_CHAT_API_KEY,
    process.env.STREAM_CHAT_API_SECRET
  );
  console.log('✅ StreamChat client initialized');
} else {
  console.warn('⚠️ StreamChat not configured - chat features will be disabled');
}

// Production CORS configuration
const allowedOrigins = [
  // Development
  'http://localhost:5173',
  'http://localhost:5174', 
  'http://localhost:3000',
  'http://localhost:3001',
  // Production
  'https://virtual-doc-smoky.vercel.app',
  'https://virtual-doc.vercel.app',
  'https://virtualdoc.com',
  'https://www.virtualdoc.com'
];

// Enhanced CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  optionsSuccessStatus: 200
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection with enhanced error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nrchinoz49_db_user:cc8Ajtg8IUb3baW1@clusterdoc.xa5fxvx.mongodb.net/doctorweb?retryWrites=true&w=majority&appName=Clusterdoc';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log(`📦 Database: ${mongoose.connection.db.databaseName}`);
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  if (process.env.NODE_ENV === 'production') {
    console.error('💥 Exiting due to database connection failure in production');
    process.exit(1);
  }
});

// MongoDB connection event listeners
mongoose.connection.on('error', (error) => {
  console.error('📊 MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.warn('📊 MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('📊 MongoDB reconnected');
});

// User Schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  height: {
    type: String
  },
  weight: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  medicalHistory: {
    allergies: [String],
    medications: [String],
    conditions: [String],
    surgeries: [{
      procedure: String,
      date: Date,
      hospital: String
    }]
  },
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String
  },
  // Additional medical fields
  familyHistory: {
    type: String
  },
  smokingStatus: {
    type: String,
    enum: ['never', 'former', 'current']
  },
  alcoholConsumption: {
    type: String,
    enum: ['none', 'occasional', 'moderate', 'heavy']
  },
  exerciseFrequency: {
    type: String,
    enum: ['none', 'rarely', 'weekly', 'daily']
  },
  dietaryRestrictions: {
    type: String
  },
  notes: {
    type: String
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'xh', 'ts'],
    default: 'en'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        message: 'All required fields must be provided' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        message: 'Passwords do not match' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      preferredLanguage: user.preferredLanguage
    };

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Sign In
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      preferredLanguage: user.preferredLanguage
    };

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user medical information
app.put('/api/auth/update-medical-info', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const medicalData = req.body;
    
    console.log('Received medical data:', medicalData);
    console.log('User ID:', userId);
    
    // Map flat fields to nested schema structure
    const updateData = {};
    
    // Basic health info (direct mapping)
    if (medicalData.dateOfBirth) updateData.dateOfBirth = medicalData.dateOfBirth;
    if (medicalData.gender) updateData.gender = medicalData.gender;
    if (medicalData.bloodType) updateData.bloodType = medicalData.bloodType;
    if (medicalData.height) updateData.height = medicalData.height;
    if (medicalData.weight) updateData.weight = medicalData.weight;
    
    // Medical history (nested mapping)
    const medicalHistory = {};
    if (medicalData.allergies) medicalHistory.allergies = medicalData.allergies;
    if (medicalData.currentMedications) medicalHistory.medications = medicalData.currentMedications;
    if (medicalData.medicalConditions) medicalHistory.conditions = medicalData.medicalConditions;
    if (medicalData.surgeries) medicalHistory.surgeries = medicalData.surgeries;
    if (Object.keys(medicalHistory).length > 0) {
      updateData.medicalHistory = medicalHistory;
    }
    
    // Insurance (nested mapping)
    const insurance = {};
    if (medicalData.insuranceProvider) insurance.provider = medicalData.insuranceProvider;
    if (medicalData.insurancePolicyNumber) insurance.policyNumber = medicalData.insurancePolicyNumber;
    if (Object.keys(insurance).length > 0) {
      updateData.insurance = insurance;
    }
    
    // Emergency contact (nested mapping)
    const emergencyContact = {};
    if (medicalData.emergencyContactName) emergencyContact.name = medicalData.emergencyContactName;
    if (medicalData.emergencyContactPhone) emergencyContact.phone = medicalData.emergencyContactPhone;
    if (medicalData.emergencyContactRelation) emergencyContact.relationship = medicalData.emergencyContactRelation;
    if (Object.keys(emergencyContact).length > 0) {
      updateData.emergencyContact = emergencyContact;
    }
    
    // Additional fields that need to be added to schema
    if (medicalData.familyHistory) updateData.familyHistory = medicalData.familyHistory;
    if (medicalData.smokingStatus) updateData.smokingStatus = medicalData.smokingStatus;
    if (medicalData.alcoholConsumption) updateData.alcoholConsumption = medicalData.alcoholConsumption;
    if (medicalData.exerciseFrequency) updateData.exerciseFrequency = medicalData.exerciseFrequency;
    if (medicalData.dietaryRestrictions) updateData.dietaryRestrictions = medicalData.dietaryRestrictions;
    if (medicalData.notes) updateData.notes = medicalData.notes;
    
    console.log('Mapped update data:', updateData);
    
    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User updated successfully');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating medical info:', error);
    res.status(500).json({ message: 'Error updating medical information', error: error.message });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates through this route
    delete updates.email; // Don't allow email updates through this route

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Doctor Web API is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.json({
      database: states[dbState],
      message: dbState === 1 ? 'Database connected successfully' : 'Database connection issue'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database connection test failed',
      error: error.message
    });
  }
});

// =====================
// StreamChat Endpoints
// =====================

// Generate StreamChat token for patient
app.post('/api/stream-token', async (req, res) => {
  try {
    if (!streamChatClient) {
      return res.status(503).json({
        success: false,
        error: 'StreamChat service not available'
      });
    }

    const { patientName } = req.body;
    
    if (!patientName || patientName.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        error: 'Patient name is required' 
      });
    }

    const patientId = `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create patient user in Stream Chat
    await streamChatClient.upsertUser({
      id: patientId,
      name: patientName.trim(),
      role: 'user',
      image: `https://getstream.io/random_png/?id=${patientId}&name=${encodeURIComponent(patientName)}`
    });

    // Create doctor user if doesn't exist (for demo purposes)
    await streamChatClient.upsertUser({
      id: 'dr-sarah-johnson',
      name: 'Dr. Sarah Johnson',
      role: 'admin',
      image: 'https://virtual-doc-smoky.vercel.app/images/doctor1.jpg'
    });

    const token = streamChatClient.createToken(patientId);
    
    console.log(`✅ Generated StreamChat token for patient: ${patientId}`);
    
    res.json({ 
      success: true, 
      token,
      userId: patientId,
      patientName: patientName.trim()
    });
    
  } catch (error) {
    console.error('❌ StreamChat token generation error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate token. Please try again.' 
    });
  }
});

// Create consultation channel
app.post('/api/create-channel', async (req, res) => {
  try {
    if (!streamChatClient) {
      return res.status(503).json({
        success: false,
        error: 'StreamChat service not available'
      });
    }

    const { patientId, doctorId = 'dr-sarah-johnson' } = req.body;
    
    if (!patientId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Patient ID is required' 
      });
    }

    const channelId = `consultation-${patientId}-${doctorId}`;
    
    const channel = streamChatClient.channel('messaging', channelId, {
      name: `Medical Consultation`,
      members: [patientId, doctorId],
      created_by_id: patientId,
      image: 'https://virtual-doc-smoky.vercel.app/images/consultation-icon.png'
    });

    await channel.create();
    
    console.log(`✅ Created consultation channel: ${channelId}`);
    
    res.json({ 
      success: true, 
      channelId,
      members: [patientId, doctorId]
    });
    
  } catch (error) {
    console.error('❌ Channel creation error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create channel. Please try again.' 
    });
  }
});

// StreamChat health check
app.get('/api/stream-health', (req, res) => {
  res.json({
    streamChatEnabled: !!streamChatClient,
    apiKey: process.env.STREAM_CHAT_API_KEY ? 'configured' : 'missing',
    status: streamChatClient ? 'ready' : 'disabled'
  });
});

// Root endpoint with API information
app.get('/', (req, res) => {
  res.json({
    message: 'VirtualDoc Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      authentication: [
        'POST /api/auth/signup - Register new user',
        'POST /api/auth/signin - User login',
        'GET /api/auth/profile - Get user profile (protected)',
        'PUT /api/auth/profile - Update user profile (protected)'
      ],
      streamChat: streamChatClient ? [
        'POST /api/stream-token - Generate chat token',
        'POST /api/create-channel - Create consultation channel',
        'GET /api/stream-health - StreamChat status'
      ] : ['StreamChat not configured'],
      health: [
        'GET /api/health - API health check',
        'GET /api/test-db - Database connection test'
      ]
    },
    documentation: 'Visit /api for endpoint documentation'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;