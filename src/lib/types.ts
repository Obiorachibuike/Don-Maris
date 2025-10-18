

export type ProductType = 'Power Flex' | 'Charging Flex' | 'Screen' | 'Backglass' | 'Glass' | 'Tools';

export type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  images: string[];
  brand: string;
  type: ProductType;
  rating: number;
  reviews: Review[];
  data_ai_hint: string;
  isFeatured?: boolean;
  dateAdded: string;
  stock: number;
  totalSales?: number;
};

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
};

export type OrderItem = {
  productId: string;
  quantity: number;
};

export type PaymentStatus = 'paid' | 'unpaid';
export type OrderPaymentStatus = 'Paid' | 'Not Paid' | 'Incomplete';
export type DeliveryMethod = 'Waybill' | 'Come Market';

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  lifetimeValue?: number;
}

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'sales' | 'accountant' | 'supplier' | 'customer';
  dateJoined: string;
  avatar: string;
  ledgerBalance?: number;
  lifetimeValue?: number;
  isVerified?: boolean;
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
  countryCode?: string;
}

export interface PrintHistoryEntry {
  printedBy: string;
  printedAt: string;
}

export interface Order {
  id: string;
  customer: Customer;
  shippingAddress: string;
  amount: number;
  status: 'Fulfilled' | 'Processing' | 'Pending' | 'Cancelled';
  date: string;
  paymentMethod: string;
  items: OrderItem[];
  deliveryMethod: DeliveryMethod;
  paymentStatus: OrderPaymentStatus;
  amountPaid: number;
  printHistory?: PrintHistoryEntry[];
}
