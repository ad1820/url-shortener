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

(async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/url_shortner`);
    console.log(`MongoDB connected, Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
})();

// API route to shorten
app.post("/api/shorten", async (req, res) => {
  const { originalURL } = req.body;

  if (!originalURL) {
    return res.status(400).json({ error: "originalURL is required" });
  }

  const shortURL = nanoid(10);

  try {
    const existing = await URL.findOne({ originalURL });
    if (existing) {
      existing.clicks++;
      await existing.save();
      return res.status(200).json({ message: "URL already exists", newURL: existing });
    }

    const newURL = new URL({ originalURL, shortURL });
    await newURL.save();
    return res.status(201).json({ message: "Short URL created", newURL });
  } catch (err) {
    console.log("DB error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Redirect route
app.get("/:shortURL", async (req, res) => {
  const entry = await URL.findOne({ shortURL: req.params.shortURL });
  if (!entry) return res.status(404).send("Not found");
  entry.clicks++;
  await entry.save();
  res.redirect(entry.originalURL);
});

// Serve frontend last
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "dist", "index.html"));
  });
}

app.listen(port, () => console.log(`Server running on port ${port}`));
