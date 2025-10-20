
import mongoose from 'mongoose';
import type { Brand as BrandType } from '@/lib/types';

const BrandSchema = new mongoose.Schema<BrandType>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
});

export default mongoose.models.Brand || mongoose.model<BrandType>('Brand', BrandSchema);
