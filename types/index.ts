export interface Affiliate {
  id: string;
  name: string;
  code: string;
  email: string;
  paymentMethod: string;
  totalCommissions: number;
  clientsCount: number;
}

export interface Lead {
  id: string;
  clientName: string;
  phone: string;
  serviceType: string;
  estimatedAmount: number;
  affiliateCode: string;
  status: 'pending' | 'confirmed' | 'paid';
  commission: number;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'affiliate';
  affiliateCode?: string;
}