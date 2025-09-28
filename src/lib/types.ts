

export type ProductType = 'Power Flex' | 'Charging Flex' | 'Screen' | 'Backglass' | 'Glass' | 'Tools';

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
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
};

export type PaymentStatus = 'paid' | 'unpaid';

// New types for Orders
export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface User extends Customer {
    role: 'admin' | 'sales' | 'accountant' | 'supplier' | 'customer';
    dateJoined: string;
}

export type DeliveryMethod = 'Waybill' | 'Come Market';

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
}
