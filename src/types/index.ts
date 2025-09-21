export interface ProductSize {
    id: number;
    product_id: number;
    size_id: number;
    size: string;
    price: number;
}

export interface ProductWithSizes {
    id: number;
    name: string;
    barcode: string;
    category_id: number;
    sizes: ProductSize[];
}

export interface CartItem {
    product: ProductWithSizes;
    size: ProductSize;
    quantity: number;
    extraAmount?: number;
}