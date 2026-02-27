export interface Order {
  id: string;
  patientId: string;
  providerId?: string;
  prescriptionId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  requiresPrescription: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentMethod =
  | 'credit-card'
  | 'debit-card'
  | 'insurance'
  | 'hsa'
  | 'fsa'
  | 'cash';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded';

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  productId: string;
  productName: string;
  dosage: string;
  frequency: string;
  duration: string;
  refillsRemaining: number;
  refillsTotal: number;
  status: PrescriptionStatus;
  issuedAt: string;
  expiresAt: string;
}

export type PrescriptionStatus =
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'on-hold'
  | 'completed';
