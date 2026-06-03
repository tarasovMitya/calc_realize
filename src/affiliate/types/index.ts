export interface AffiliatePerformer {
  id: string;
  name: string;
  phone: string;
  telegram: string;
  avatar: string;
  rating: number;
  completedOrders: number;
  balance: number;
  isOnline: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
  specializations: string[];
  createdAt?: string;
}

export interface AffiliateOrder {
  id: string;
  performerName: string | null;
  performerId: string | null;
  clientName: string;
  categoryName: string;
  serviceName: string;
  address: string;
  priceTotal: number;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  createdAt: string;
  disputeComment: string | null;
}

export interface AffiliateEarning {
  id: string;
  orderId: string;
  performerId: string;
  performerName?: string;
  orderAmount: number;
  platformFee: number;
  affiliateFee: number;
  createdAt: string;
}

export interface AffiliateTask {
  id: string;
  title: string;
  description: string;
  priority: "low" | "normal" | "high";
  target: string;
  dueDate: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface AffiliateStats {
  performersCount: number;
  completedOrders: number;
  totalEarned: number;
  openDisputes: number;
}

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Низкий",
  normal: "Средний",
  high: "Высокий",
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
};
