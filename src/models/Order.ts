
import mongoose from 'mongoose';
import type { Order as OrderType, PrintHistoryEntry } from '@/lib/types';

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


const OrderSchema = new mongoose.Schema<OrderType>({
  id: { type: String, required: true, unique: true },
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
  printHistory: [PrintHistoryEntrySchema],
  createdBy: { type: String },
  paymentDetails: {
      opayReference: String,
      opayOrderNo: String,
      flutterwaveTxRef: String,
  }
});

export default mongoose.models.Order || mongoose.model<OrderType>('Order', OrderSchema);
