import { Affiliate, Lead } from '../types';

export const mockAffiliates: Affiliate[] = [
  {
    id: '1',
    name: 'Amina Benali',
    code: 'amina123',
    email: 'amina@example.com',
    paymentMethod: 'Virement bancaire',
    totalCommissions: 2450.00,
    clientsCount: 8
  },
  {
    id: '2',
    name: 'Mohamed Alami',
    code: 'mohamed456',
    email: 'mohamed@example.com',
    paymentMethod: 'PayPal',
    totalCommissions: 1850.00,
    clientsCount: 6
  },
  {
    id: '3',
    name: 'Sarah Tahiri',
    code: 'sarah789',
    email: 'sarah@example.com',
    paymentMethod: 'Chèque',
    totalCommissions: 3200.00,
    clientsCount: 12
  }
];

export const mockLeads: Lead[] = [
  {
    id: '1',
    clientName: 'Hassan Entreprises',
    phone: '+212 6 12 34 56 78',
    serviceType: 'Site e-commerce',
    estimatedAmount: 15000,
    affiliateCode: 'amina123',
    status: 'confirmed',
    commission: 1500,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    clientName: 'Café Central',
    phone: '+212 6 87 65 43 21',
    serviceType: 'Site vitrine',
    estimatedAmount: 5000,
    affiliateCode: 'mohamed456',
    status: 'paid',
    commission: 500,
    createdAt: '2024-01-12'
  },
  {
    id: '3',
    clientName: 'Cabinet Médical Dr. Lahlou',
    phone: '+212 6 55 44 33 22',
    serviceType: 'Application métier',
    estimatedAmount: 25000,
    affiliateCode: 'sarah789',
    status: 'pending',
    commission: 2500,
    createdAt: '2024-01-18'
  },
  {
    id: '4',
    clientName: 'Restaurant Al Fassia',
    phone: '+212 6 11 22 33 44',
    serviceType: 'Site vitrine + SEO',
    estimatedAmount: 8000,
    affiliateCode: 'amina123',
    status: 'confirmed',
    commission: 800,
    createdAt: '2024-01-20'
  },
  {
    id: '5',
    clientName: 'Boutique Mode Chic',
    phone: '+212 6 99 88 77 66',
    serviceType: 'Site e-commerce',
    estimatedAmount: 12000,
    affiliateCode: 'sarah789',
    status: 'pending',
    commission: 1200,
    createdAt: '2024-01-22'
  }
];