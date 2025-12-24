import { mediaQueue } from '../queues/mediaQueue';

async function testQueue() {
  console.log('Starting queue test...');
  
  try {
    const job = await mediaQueue.add('test-job', { 
      type: 'test',
      timestamp: new Date().toISOString(),
      message: 'This is a connection test'
    });

    console.log(`Job added successfully! Job ID: ${job.id}`);
    console.log('Redis connection appears to be working.');
    
  } catch (error) {
    console.error('Error adding job to queue:', error);
  } finally {
    // Clean up connection to allow script to exit
    await mediaQueue.close();
    process.exit(0);
  }
}

testQueue();
