import mongoose from "mongoose";

const Favorites = new mongoose.Schema({
  userId: { type: String, required: true },
  addedAt: { type: Date, default: Date.now }
});

export default mongoose.model('FavoriteTitle', Favorites);

