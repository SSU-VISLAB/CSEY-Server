import { createClient } from 'redis';

const redisClient = createClient({
  url: `redis://:${process.env.REDIS_KEY}@${process.env.DB_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

const connectRedis = async () => {
  await redisClient.connect();
};

export { connectRedis, redisClient };

