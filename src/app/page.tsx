import { HomePage } from '@/components/home-page';
import { getProducts } from '@/lib/data';

export default function Home() {
  const products = getProducts();
  const brands = [...new Set(products.map((p) => p.brand))].sort();
  const types = [...new Set(products.map((p) => p.type))].sort();
  const maxPrice = Math.max(...products.map(p => p.price));

  return <HomePage products={products} brands={brands} types={types} maxPrice={maxPrice} />;
}
