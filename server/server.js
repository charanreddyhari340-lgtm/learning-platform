const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const Course = require('./models/Course');
const seedData = require('./seeders/seed');

const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();

let dbInitialization;

const initDB = () => {
  if (!dbInitialization) {
    dbInitialization = (async () => {
      await connectDB();
      const courseCount = await Course.countDocuments();
      if (courseCount === 0) {
        console.log('Database empty — auto-seeding...');
        await seedData();
      }
    })().catch((error) => {
      dbInitialization = null;
      throw error;
    });
  }

  return dbInitialization;
};

// CORS - allow frontend origin
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some((o) => origin.startsWith(o))) {
        return callback(null, true);
      }
      return callback(null, true); // permissive for now; tighten after deploy
    },
    credentials: true,
  }),
);

app.use('/api', (req, res, next) => {
  initDB().then(() => next()).catch(next);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Uploaded documents are forced to download; other uploads remain inline for media playback.
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use(
  '/uploads/documents',
  express.static(path.join(uploadsPath, 'documents'), {
    setHeaders: (res, filePath) => {
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    },
  }),
);
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/instructor', require('./routes/instructorRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'SkillForge MERN LMS',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend build (Express static hosting fallback)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('SkillForge API is running. Frontend not built yet.');
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// ─── Local Dev: start HTTP server ───────────────────────────────────────────
if (require.main === module) {
  const DEFAULT_PORT = Number(process.env.PORT || 5000);

  const listenOnPort = (port) => {
    const server = app.listen(port, async () => {
      try {
        await initDB();
        console.log(`====================================================`);
        console.log(` SkillForge API running on port ${port}`);
        console.log(` http://localhost:${port}/api/health`);
        console.log(`====================================================`);
      } catch (error) {
        console.error('Database initialization failed:', error.message);
        server.close(() => {
          process.exitCode = 1;
        });
      }
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE' && port < 5100) {
        console.warn(`Port ${port} busy — retrying on ${port + 1}...`);
        listenOnPort(port + 1);
      } else {
        console.error('Server error:', error.message);
        process.exit(1);
      }
    });
  };

  listenOnPort(DEFAULT_PORT);
}

module.exports = app;
