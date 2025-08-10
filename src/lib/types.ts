export type Product = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  image: string;
  brand: string;
  type: 'Case' | 'Charger' | 'Screen Protector' | 'Headphones' | 'Car Mount';
  rating: number;
  reviews: Review[];
  data_ai_hint: string;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};
