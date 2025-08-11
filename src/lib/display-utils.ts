
import type { ProductType } from './types';

export function formatProductType(type: ProductType): string {
    switch (type) {
        case 'Charging Flex':
            return 'C/F';
        case 'Power Flex':
            return 'P/F';
        default:
            return type;
    }
}
