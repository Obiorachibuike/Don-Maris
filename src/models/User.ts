

import mongoose from 'mongoose';
import type { User as UserType } from '@/lib/types';

const UserSchema = new mongoose.Schema<UserType>({
  name: {
    type: String,
    required: [true, 'Please provide your name.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email.'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please provide a valid email address.'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'sales', 'accountant', 'supplier', 'customer'],
    default: 'customer',
  },
  country: {
      type: String,
  },
  countryCode: {
    type: String,
  },
  currency: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifyToken: String,
  verifyTokenExpiry: Date,
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,
  dateJoined: {
    type: String,
    default: () => new Date().toISOString(),
  },
  avatar: {
    type: String,
    default: 'https://placehold.co/100x100.png'
  },
  ledgerBalance: {
      type: Number,
      default: 0
  },
  lifetimeValue: {
      type: Number,
      default: 0
  },
  virtualBankName: String,
  virtualAccountNumber: String,
  virtualAccountName: String,
  age: {
      type: Number,
  }
});

export default mongoose.models.User || mongoose.model<UserType>('User', UserSchema);
