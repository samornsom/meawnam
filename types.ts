export interface Transaction {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  productName: string;
  category: string;
  price: number;
  cost: number; // Cost per unit
  quantity: number;
  platform: 'Shopee' | 'Lazada' | 'TikTok' | 'Facebook' | 'Line';
  status: 'Completed' | 'Pending' | 'Cancelled';
}

export interface SummaryStats {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  averageOrderValue: number;
  topProduct: string;
}

export interface SalesInsight {
  summary: string;
  trend: string;
  recommendation: string;
}