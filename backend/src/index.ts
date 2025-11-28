import express from 'express';
import cors from 'cors';
import { config } from './config/config';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import climbRoutes from './routes/climbRoutes';
import sessionRoutes from './routes/sessionRoutes';
import feedRoutes from './routes/feedRoutes';
import locationRoutes from './routes/locationRoutes';
import friendRoutes from './routes/friendRoutes';
import commentRoutes from './routes/commentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import uploadRoutes from './routes/uploadRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/climbs', climbRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
