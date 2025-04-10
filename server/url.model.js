import mongoose, {Schema} from "mongoose";

const urlSchema = new Schema({
    originalURL: String,
    shortURL: String,
    clicks: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
})

export const URL = mongoose.model('URL', urlSchema)