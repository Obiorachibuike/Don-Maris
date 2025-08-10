
import { NextResponse } from 'next/server';
import type { Product } from '@/lib/types';

// In a real application, this data would come from a database.
const products: Product[] = [
  {
    id: '3',
    name: 'iPhone 14 Pro Max OLED Screen Replacement',
    description: 'Vibrant and responsive OLED replacement screen.',
    longDescription: 'Restore your iPhone 14 Pro Max to its former glory with this high-quality OLED screen replacement. It offers the same vibrant colors, deep blacks, and responsive touch as the original. Each kit includes the necessary tools for installation.',
    price: 189.99,
    image: 'https://placehold.co/600x600.png',
    data_ai_hint: 'phone screen',
    brand: 'ScreenSavvy',
    type: 'Screen',
    rating: 4.7,
    reviews: [],
    isFeatured: true,
    dateAdded: '2023-11-15',
  },
  {
    id: '5',
    name: 'Pro-Tech 25-in-1 Repair Toolkit',
    description: 'Essential tools for any phone repair.',
    longDescription: 'The Pro-Tech toolkit has everything you need for DIY phone repairs. It includes various pentalobe, Phillips, and flathead screwdrivers, spudgers, suction cups, and picks, all housed in a compact, organized case. Made with high-quality CR-V steel for durability.',
    price: 24.99,
    image: 'https://placehold.co/600x600.png',
    data_ai_hint: 'repair tools',
    brand: 'Pro-Tech',
    type: 'Tools',
    rating: 4.9,
    reviews: [],
    isFeatured: true,
    dateAdded: '2023-11-20',
  },
  {
    id: '6',
    name: 'Galaxy S23 Ultra Charging Port Flex Cable',
    description: 'OEM-grade replacement for faulty charging ports.',
    longDescription: 'Fix charging issues with your Samsung Galaxy S23 Ultra with this replacement flex cable. This component includes the USB-C port, primary microphone, and cellular antenna connections. Ensures reliable charging and data sync.',
    price: 22.50,
    image: 'https://placehold.co/600x600.png',
    data_ai_hint: 'flex cable',
    brand: 'PartPerfect',
    type: 'Charging Flex',
    rating: 4.6,
    reviews: [],
    dateAdded: '2023-11-18',
  },
  {
    id: '8',
    name: 'iPhone 12/13/14 Power & Volume Flex Cable',
    description: 'Replacement for power button and volume controls.',
    longDescription: 'This flex cable assembly replaces the power button, volume buttons, and mute/ring switch for various iPhone models. Ideal for fixing unresponsive or malfunctioning buttons. Please select your specific model before ordering.',
    price: 18.99,
    image: 'https://placehold.co/600x600.png',
    data_ai_hint: 'volume button',
    brand: 'PartPerfect',
    type: 'Power Flex',
    rating: 4.5,
    reviews: [],
    dateAdded: '2023-11-08',
  },
  {
    id: '9',
    name: 'Pixel 7 Pro Screen Replacement Kit',
    description: 'High-quality screen with included adhesive.',
    longDescription: 'Bring your Google Pixel 7 Pro display back to life. This kit includes a high-fidelity screen and pre-cut adhesive for a secure, water-resistant fit. The display offers accurate colors and touch response.',
    price: 145.00,
    image: 'https://placehold.co/600x600.png',
    data_ai_hint: 'pixel screen',
    brand: 'ScreenSavvy',
    type: 'Screen',
    rating: 4.7,
    reviews: [],
    dateAdded: '2023-10-25',
  },
];


export async function GET() {
    // Simulate a delay to mimic a real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return NextResponse.json(products);
}
