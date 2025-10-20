

import mongoose from 'mongoose';
import type { Product as ProductType, Review as ReviewType, StockHistoryEntry } from '@/lib/types';

const ReviewSchema = new mongoose.Schema<ReviewType>({
  id: { type: String, required: true },
  author: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  date: { type: String, required: true },
});

const StockHistoryEntrySchema = new mongoose.Schema<StockHistoryEntry>({
  date: { type: String, required: true },
  quantityChange: { type: Number, required: true },
  newStockLevel: { type: Number, required: true },
  type: { type: String, enum: ['Initial', 'Admin Update', 'Sale'], required: true },
  updatedBy: { type: String, required: true },
}, { _id: false });

const ProductSchema = new mongoose.Schema<ProductType>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true },
  brand: { type: String, required: true },
  type: {
    type: String,
    enum: ['Power Flex', 'Charging Flex', 'Screen', 'Backglass', 'Glass', 'Tools', 'Machine'],
    required: true,
  },
  rating: { type: Number, required: true },
  reviews: [ReviewSchema],
  data_ai_hint: { type: String, required: true },
  isFeatured: { type: Boolean, default: false },
  dateAdded: { type: String, required: true },
  stock: { type: Number, required: true },
  stockHistory: [StockHistoryEntrySchema],
});

export default mongoose.models.Product || mongoose.model<ProductType>('Product', ProductSchema);
