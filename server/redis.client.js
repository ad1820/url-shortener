import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URI || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.log("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.log("Redis connection error:", error);
    // App can still work without Redis, just slower
  }
};

export default redisClient;