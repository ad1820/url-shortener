import mongoose, { Schema } from "mongoose";

const urlSchema = new Schema(
  {
    originalURL: {
      type: String,
      required: true,
    },
    shortURL: {
      type: String,
      required: true,
      unique: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
urlSchema.index({ shortURL: 1 }); // Most critical - used for redirects
urlSchema.index({ originalURL: 1 }); // For duplicate checking
urlSchema.index({ createdAt: -1 }); // For date-based queries

export const URL = mongoose.model("URL", urlSchema);