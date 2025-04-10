import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import { URL } from "./url.model.js";
import { nanoid } from "nanoid";
import cors from "cors";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;

// MongoDB connection
(async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/url_shortner`
    );
    console.log(
      `MONGODB connected successfully, DB host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`MONGODB connection error: ${error}`);
    process.exit(1);
  }
})();

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) return next();
    res.sendFile(path.resolve(__dirname, "../client", "dist", "index.html"));
  });
}

// API to create short URL
app.post("/api/shorten", async (req, res) => {
  const { originalURL } = req.body;

  if (!originalURL) {
    return res.status(400).json({ error: "Original URL required" });
  }

  const shortURL = nanoid(10).toString();

  try {
    const existing = await URL.findOne({ originalURL });
    if (existing) {
      existing.clicks++;
      await existing.save();
      return res
        .status(200)
        .json({ message: "URL already exists", newURL: existing });
    }

    const newURL = new URL({ originalURL, shortURL });
    await newURL.save();
    return res.status(201).json({ message: "URL generated", newURL: newURL });
  } catch (error) {
    console.log("DB error", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// Redirect from short URL
app.get("/:shortURL", async (req, res) => {
  try {
    const entry = await URL.findOne({ shortURL: req.params.shortURL });
    if (!entry) return res.status(404).send("Not found");
    entry.clicks++;
    await entry.save();
    res.redirect(entry.originalURL);
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});
