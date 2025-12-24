import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { logger } from '../utils/logger';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const mediaWorker = new Worker(
  'media-processing',
  async (job) => {
    logger.info(`Procesando trabajo: ${job.id}`);
  },
  { connection }
);
