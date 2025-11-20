
export type ProductType = 'Power Flex' | 'Charging Flex' | 'Screen' | 'Backglass' | 'Glass' | 'Tools' | 'Machine' | 'Touch Pad';

export type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};

export type StockHistoryEntry = {
  date: string;
  quantityChange: number;
  newStockLevel: number;
  type: 'Initial' | 'Admin Update' | 'Sale';
  updatedBy: string; // User ID or name
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
  stockHistory?: StockHistoryEntry[];
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

export type PaymentStatus = 'paid' | 'unpaid' | 'partial' | 'failed';
export type OrderPaymentStatus = 'Paid' | 'Not Paid' | 'Incomplete' | 'Pending';
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
  status?: 'active' | 'inactive';
  forceLogoutBefore?: Date;
  dateJoined: string;
  avatar: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  ledgerBalance?: number;
  lifetimeValue?: number;
  isVerified?: boolean;
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
  country?: string;
  countryCode?: string;
  currency?: string;
  virtualBankName?: string;
  virtualAccountNumber?: string;
  virtualAccountName?: string;
  age?: number;
  authProvider?: string;
  authProviderId?: string;
}

export interface PrintHistoryEntry {
  printedBy: string;
  printedAt: string;
}

export interface OrderEditHistoryEntry {
  editedBy: string;
  editedAt: string;
  previousState: {
    items: OrderItem[];
    amount: number;
  };
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
  createdBy?: string;
  paymentDetails?: {
    opayReference?: string;
    opayOrderNo?: string;
    flutterwaveTxRef?: string;
  };
  editHistory?: OrderEditHistoryEntry[];
}

export interface Brand {
    _id: string;
    id: string;
    name: string;
}
