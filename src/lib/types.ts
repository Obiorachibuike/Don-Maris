
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
  image: string;
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

export interface User extends Customer {
    role: 'admin' | 'sales' | 'accountant' | 'supplier' | 'customer';
    dateJoined: string;
    ledgerBalance?: number; // moved here, optional
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
}
