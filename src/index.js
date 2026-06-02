import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import careerRoutes from './routes/careerRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import contactSubmissionRoutes from './routes/contactSubmissionRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import contentRoutes from './routes/contentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  process.env.ADMIN_URL || 'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploads folder for backward compatibility (legacy files)
// Note: New uploads are handled by Cloudinary (see cloudinary.js config)
// This serves any existing files in the local uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// DB initialization
initDatabase()
  .then(() => {
    console.log('Database verification and seeding completed.');
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/contact-submissions', contactSubmissionRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/content', contentRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Multer and general Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File size limit exceeded (Max 10MB).' });
  }
  if (err.message && err.message.includes('Only document files')) {
    return res.status(400).json({ message: err.message });
  }
  
  console.error('Global Error Handler:', err);
  res.status(500).json({ 
    message: err.message || 'An unexpected error occurred on the server.' 
  });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
