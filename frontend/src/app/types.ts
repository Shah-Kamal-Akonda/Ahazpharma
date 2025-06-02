// frontend/app/types.ts
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category?: Category;
  categoryId?: number;
  quantity: number;
  quantityUnit: 'ML' | 'GM';
  image?: string;
}

export interface Category {
  id: number;
  name: string;
  image?: string;
  products?: Product[]; // Changed to optional
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  id: string;
  division: string;
  district: string;
  city: string;
  addressLine: string;
  recipientName: string;
  phoneNumber: string;
  email: string;
}