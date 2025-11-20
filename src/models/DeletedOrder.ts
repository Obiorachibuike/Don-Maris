
import mongoose from 'mongoose';
import type { Order as OrderType, PrintHistoryEntry, OrderEditHistoryEntry, OrderItem } from '@/lib/types';

// This interface extends the base OrderType to include deletion info
export interface IDeletedOrder extends OrderType {
  deletedBy: string;
  deletedAt: Date;
}

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, required: true },
}, { _id: false });

const PrintHistoryEntrySchema = new mongoose.Schema<PrintHistoryEntry>({
    printedBy: { type: String, required: true },
    printedAt: { type: String, required: true },
}, { _id: false });

const OrderEditHistorySchema = new mongoose.Schema<OrderEditHistoryEntry>({
    editedBy: { type: String, required: true },
    editedAt: { type: String, required: true },
    previousState: {
        items: [OrderItemSchema],
        amount: Number,
    }
}, { _id: false });


const DeletedOrderSchema = new mongoose.Schema<IDeletedOrder>({
  // All fields from the original Order schema
  id: { type: String, required: true },
  customer: { type: CustomerSchema, required: true },
  shippingAddress: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Fulfilled', 'Processing', 'Pending', 'Cancelled'],
    required: true,
  },
  date: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  items: [OrderItemSchema],
  deliveryMethod: {
      type: String,
      enum: ['Waybill', 'Come Market'],
      required: true
  },
  paymentStatus: {
      type: String,
      enum: ['Paid', 'Not Paid', 'Incomplete', 'Pending'],
      required: true
  },
  amountPaid: {
      type: Number,
      required: true,
      default: 0
  },
  printHistory: { type: [PrintHistoryEntrySchema], default: [] },
  createdBy: { type: String },
  paymentDetails: {
      opayReference: String,
      opayOrderNo: String,
      flutterwaveTxRef: String,
  },
  editHistory: { type: [OrderEditHistorySchema], default: [] },
  // New fields for archival
  deletedBy: { type: String, required: true },
  deletedAt: { type: Date, default: Date.now },
});

// Ensure we don't re-register the model on hot reloads
export default mongoose.models.DeletedOrder || mongoose.model<IDeletedOrder>('DeletedOrder', DeletedOrderSchema);
