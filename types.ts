
export type UserRole = 'USER' | 'OWNER' | 'ADMIN';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'SHORT_SUPPLY' | 'ARRIVING_SOON' | 'NOT_AVAILABLE';

export type ApprovalStatus = 'PENDING_PAYMENT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export type PlanType = 'FREE' | 'BASIC' | 'PRO' | 'ELITE';

export interface Plan {
  id: PlanType;
  name: string;
  price: string;
  features: string[];
  color: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  storeId?: string;
  phone?: string;
  avatar?: string;
  password?: string;
}

export interface Product {
  id: string;
  name: string;
  urduName: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
  description: string;
  inStock: boolean;
  stockStatus: StockStatus;
  storeId: string;
  expiryDate?: string;
}

export interface Order {
  id: string;
  storeId: string;
  customerName: string;
  customerDistance: number; // in km
  totalAmount: number;
  status: OrderStatus;
  date: string;
  items: string[];
}

export interface AppNotification {
  id: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING' | 'NEW_REQUEST';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  urduName: string;
  address: string;
  urduAddress: string;
  distance: string;
  rating: number;
  image: string;
  phone: string;
  isOnline: boolean;
  type?: string;
  city?: string;
  area?: string;
  approvalStatus: ApprovalStatus;
  selectedPlan?: PlanType;
}

export interface SearchInsight {
  id: string;
  userEmail: string;
  query: string;
  timestamp: string;
}
