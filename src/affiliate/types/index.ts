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

export type TaskCategory = "task" | "instruction" | "script" | "access" | "creative";
export type TaskWorkflowStatus = "todo" | "in_progress" | "needs_clarification" | "done";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
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
  category: TaskCategory;
  workflowStatus: TaskWorkflowStatus;
  checklist: ChecklistItem[];
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
  low: "bg-[#1a1f35] text-[#6b7194]",
  normal: "bg-[#001a4d] text-[#6699ff]",
  high: "bg-[#2d1200] text-[#ff6b35]",
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  task: "Задача",
  instruction: "Инструкция",
  script: "Скрипт",
  access: "Доступ",
  creative: "Креатив",
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  task: "bg-[#001a4d] text-[#6699ff]",
  instruction: "bg-[#001a2d] text-[#00aaff]",
  script: "bg-[#1a0d2d] text-[#aa66ff]",
  access: "bg-[#002d1a] text-[#00cc66]",
  creative: "bg-[#2d1a00] text-[#ffaa33]",
};

export const WORKFLOW_LABELS: Record<TaskWorkflowStatus, string> = {
  todo: "Необходимо выполнить",
  in_progress: "В работе",
  needs_clarification: "Требует уточнения",
  done: "Выполнено",
};
