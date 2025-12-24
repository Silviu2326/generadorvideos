import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import projectRoutes from './routes/projectRoutes';
import reminderRoutes from './routes/reminderRoutes';
import aiRoutes from './routes/aiRoutes';
import mediaRoutes from './routes/mediaRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send('Creator Studio AI Backend is running');
});

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});
