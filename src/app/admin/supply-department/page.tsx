
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SupplyItem {
    id: number;
    itemName: string;
    quantity: number;
    unitCost: number;
    discount: number;
}

const initialSupplyItems: SupplyItem[] = [
    { id: 1, itemName: "IPX BACK GLASS B", quantity: 10, unitCost: 990.00, discount: 0 },
    { id: 2, itemName: "IPX BACK GLASS W", quantity: 10, unitCost: 990.00, discount: 0 },
    { id: 3, itemName: "IPXR BACK GLASS BLACK", quantity: 2, unitCost: 990.00, discount: 0 },
    { id: 4, itemName: "IPXR BACK GLASS BLUE", quantity: 2, unitCost: 990.00, discount: 0 },
    { id: 5, itemName: "IPXR BACK GLASS CORAL", quantity: 2, unitCost: 990.00, discount: 0 },
    { id: 6, itemName: "IPXR BACK GLASS WHITE", quantity: 2, unitCost: 990.00, discount: 0 },
    { id: 7, itemName: "IPXR BACK GLASS WHITE", quantity: 2, unitCost: 990.00, discount: 0 },
    { id: 8, itemName: "IPXS MAX BACK GLASS B", quantity: 3, unitCost: 990.00, discount: 0 },
    { id: 9, itemName: "IPXS MAX BACK GLASS GOLD", quantity: 4, unitCost: 990.00, discount: 0 },
    { id: 10, itemName: "IPXS MAX BACK GLASS W", quantity: 3, unitCost: 990.00, discount: 0 },
    { id: 11, itemName: "IP11pro BACK GLASS Black", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 12, itemName: "IP11pro BACK GLASS GOLD", quantity: 4, unitCost: 2300.00, discount: 0 },
    { id: 13, itemName: "IP11pro BACK GLASS GREEN", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 14, itemName: "IP11pro BACK GLASS White", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 15, itemName: "IP11pro MAX BACK GLASS GOLD", quantity: 4, unitCost: 2300.00, discount: 0 },
    { id: 16, itemName: "IP11PRO MAX BACK GLASS GREEN", quantity: 3, unitCost: 2300.00, discount: 0 },
    { id: 17, itemName: "IP12pro BACK GLASS Black", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 18, itemName: "IP11PRO MAX BACK GLASS White", quantity: 3, unitCost: 2300.00, discount: 0 },
    { id: 19, itemName: "IP12pro BACK GLASS BLUE", quantity: 4, unitCost: 2300.00, discount: 0 },
    { id: 20, itemName: "IP12pro BACK GLASS GOLD", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 21, itemName: "IP12pro BACK GLASS White", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 22, itemName: "IP12pro MAX BACK GLASS BLACK", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 23, itemName: "IP12pro MAX BACK GLASS BLUE", quantity: 4, unitCost: 2300.00, discount: 0 },
    { id: 24, itemName: "IP12pro MAX BACK GLASS GOLD", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 25, itemName: "IP12pro MAX BACK GLASS WHITE", quantity: 2, unitCost: 2300.00, discount: 0 },
    { id: 26, itemName: "IP13pro BACK GLASS B", quantity: 2, unitCost: 2180.00, discount: 0 },
    { id: 27, itemName: "IP13pro BACK GLASS GOLD", quantity: 2, unitCost: 2180.00, discount: 0 },
    { id: 28, itemName: "IP13Pro MAX BACK GLASS GREEN", quantity: 2, unitCost: 2180.00, discount: 0 },
    { id: 29, itemName: "IP13pro BACK GLASS WHITE", quantity: 2, unitCost: 2180.00, discount: 0 },
    { id: 30, itemName: "IP13pro BACK GLASS BLUE", quantity: 2, unitCost: 2180.00, discount: