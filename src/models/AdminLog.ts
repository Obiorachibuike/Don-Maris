
import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminLog extends Document {
  timestamp: Date;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName?: string;
  details: string;
}

const AdminLogSchema: Schema = new Schema({
  timestamp: { type: Date, default: Date.now, required: true },
  adminId: { type: String, required: true },
  adminName: { type: String, required: true },
  action: { type: String, required: true, enum: ['UPDATE_USER', 'DELETE_USER', 'CHANGE_ROLE', 'UPDATE_PAYMENT', 'DELETE_ORDER', 'UPDATE_ORDER'] },
  targetType: { type: String, required: true, enum: ['User', 'Product', 'Order'] },
  targetId: { type: String, required: true },
  targetName: { type: String },
  details: { type: String, required: true },
});

export default mongoose.models.AdminLog || mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);
