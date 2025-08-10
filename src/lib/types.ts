
export type Product = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  image: string;
  brand: string;
  type: 'Case' | 'Charger' | 'Screen Protector' | 'Headphones' | 'Car Mount' | 'Screen' | 'Charging Flex' | 'Power Flex' | 'Tools';
  rating: number;
  reviews: Review[];
  data_ai_hint: string;
  isFeatured?: boolean;
  dateAdded: string;
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
