import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import morgan from 'morgan';

// Import routes
import projectRoutes from './routes/projects';
import timeLogRoutes from './routes/timeLogs';
import holidayRoutes from './routes/holidays';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Initialize Prisma client
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5445',
    'http://localhost:3000',
    'http://localhost:5174',
    'http://localhost:5175'
  ],
  credentials: true
}));
app.use(express.json());

// Add request logging
app.use(morgan('dev'));

// Add request debugging
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('[DEBUG] Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/time-logs', timeLogRoutes);
app.use('/api/holidays', holidayRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR] Unhandled exception:');
  console.error(err.stack);
  
  // Log detailed error information
  if (err.name === 'PrismaClientKnownRequestError') {
    console.error(`[PRISMA ERROR] Code: ${err.code}, Message: ${err.message}`);
    if (err.meta) {
      console.error('[PRISMA ERROR] Meta:', err.meta);
    }
  }
  
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    code: err.code || 'UNKNOWN_ERROR'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📊 API endpoints available at http://localhost:${port}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;