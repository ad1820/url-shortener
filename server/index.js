import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import { URL } from "./url.model.js";
import { nanoid } from "nanoid";
import cors from "cors";
import redisClient, { connectRedis } from "./redis.client.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;
const CACHE_TTL = 3600; // 1 hour cache

// Connect to MongoDB
(async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/url_shortner`
    );
    console.log(`MongoDB connected, Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
})();

// Connect to Redis
connectRedis();

// Helper function to safely use Redis
const getFromCache = async (key) => {
  try {
    if (!redisClient.isOpen) return null;
    return await redisClient.get(key);
  } catch (error) {
    console.log("Redis GET error:", error);
    return null;
  }
};

const setInCache = async (key, value, ttl = CACHE_TTL) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.setEx(key, ttl, value);
  } catch (error) {
    console.log("Redis SET error:", error);
  }
};

const incrementClicksInCache = async (key) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.incr(`clicks:${key}`);
  } catch (error) {
    console.log("Redis INCR error:", error);
  }
};

// API route - Create/Get short URL
app.post("/api/shorten", async (req, res) => {
  const { originalURL } = req.body;

  if (!originalURL) {
    return res.status(400).json({ error: "originalURL is required" });
  }

  try {
    // Check if URL already exists in DB
    const existing = await URL.findOne({ originalURL });

    if (existing) {
      // Cache the existing mapping
      await setInCache(existing.shortURL, existing.originalURL);

      return res.status(200).json({
        message: "URL already exists",
        newURL: existing,
      });
    }

    // Create new short URL
    const shortURL = nanoid(10);
    const newURL = new URL({ originalURL, shortURL });
    await newURL.save();

    // Cache the new mapping immediately
    await setInCache(shortURL, originalURL);

    return res.status(201).json({
      message: "Short URL created",
      newURL,
    });
  } catch (err) {
    console.log("DB error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Redirect route - The most critical endpoint
app.get("/:shortURL", async (req, res) => {
  const { shortURL } = req.params;

  try {
    // First, check Redis cache
    const cachedURL = await getFromCache(shortURL);

    if (cachedURL) {
      // Cache hit - redirect immediately
      console.log("Cache HIT for:", shortURL);

      // Increment clicks in background (non-blocking)
      incrementClicksInCache(shortURL);

      // Update DB clicks asynchronously (don't wait)
      URL.findOneAndUpdate({ shortURL }, { $inc: { clicks: 1 } }).catch((err) =>
        console.log("Background click update error:", err)
      );

      return res.redirect(cachedURL);
    }

    // Cache miss - query database
    console.log("Cache MISS for:", shortURL);
    const entry = await URL.findOne({ shortURL });

    if (!entry) {
      return res.status(404).send("Not found");
    }

    // Increment clicks and save
    entry.clicks++;
    await entry.save();

    // Store in cache for next time
    await setInCache(shortURL, entry.originalURL);

    return res.redirect(entry.originalURL);
  } catch (error) {
    console.log("Redirect error:", error);
    return res.status(500).send("Internal Server Error");
  }
});

// Analytics endpoint for frontend
app.get("/api/analytics/:shortURL", async (req, res) => {
  const { shortURL } = req.params;

  try {
    const entry = await URL.findOne({ shortURL });
    if (!entry) {
      return res.status(404).json({ error: "URL not found" });
    }

    return res.status(200).json({
      originalURL: entry.originalURL,
      shortURL: entry.shortURL,
      clicks: entry.clicks,
      createdAt: entry.createdAt,
    });
  } catch (error) {
    console.log("Analytics error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all URLs (for frontend list)
app.get("/api/urls", async (req, res) => {
  try {
    const urls = await URL.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).json({ urls });
  } catch (error) {
    console.log("Get URLs error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Periodic sync of Redis click counts to MongoDB
setInterval(async () => {
  try {
    if (!redisClient.isOpen) return;

    const keys = await redisClient.keys("clicks:*");

    for (const key of keys) {
      const shortURL = key.replace("clicks:", "");
      const clicks = await redisClient.get(key);

      if (clicks) {
        await URL.findOneAndUpdate(
          { shortURL },
          { $inc: { clicks: parseInt(clicks) } }
        );
        await redisClient.del(key);
      }
    }
  } catch (error) {
    console.log("Click sync error:", error);
  }
}, 60000); // Sync every minute

app.listen(port, () => console.log(`Server running on port ${port}`));