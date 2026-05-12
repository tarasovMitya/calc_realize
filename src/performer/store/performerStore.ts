import { create } from "zustand";
import type {
  PerformerOrder,
  PerformerOrderStatus,
  PerformerProfile,
  EarningsRecord,
  PerformerNotification,
  BankCard,
  WithdrawRecord,
} from "../types";
import { useSharedOrdersStore } from "../../store/sharedOrdersStore";
import type { AcceptResult } from "../../store/sharedOrdersStore";
import {
  mockPerformerProfile,
  mockAvailableOrders,
  mockActiveOrders,
  mockCompletedOrders,
  mockEarnings,
  mockPerformerNotifications,
  mockBankCards,
  mockWithdrawHistory,
} from "../data/mockData";
import { calculateDistance, estimateETA, formatDistance } from "../utils/distance";

interface PerformerState {
  profile: PerformerProfile;
  isOnline: boolean;
  balance: number;
  pendingBalance: number;
  availableOrders: PerformerOrder[];
  activeOrders: PerformerOrder[];
  completedOrders: PerformerOrder[];
  earnings: EarningsRecord[];
  notifications: PerformerNotification[];
  bankCards: BankCard[];
  withdrawHistory: WithdrawRecord[];

  // Actions
  toggleOnline: () => void;
  acceptOrder: (orderId: string) => AcceptResult;
  rejectOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: PerformerOrderStatus) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  updateProfile: (data: Partial<PerformerProfile>) => void;
  withdraw: (amount: number, cardId: string) => void;
  addBankCard: (card: Omit<BankCard, "id">) => void;
  removeBankCard: (id: string) => void;
  setDefaultCard: (id: string) => void;
}

/** Enrich available orders with calculated distance from performer */
function enrichWithDistance(
  orders: PerformerOrder[],
  profile: PerformerProfile
): PerformerOrder[] {
  return orders.map((o) => {
    if (!o.lat || !o.lng) return o;
    const km = calculateDistance(profile.lat, profile.lng, o.lat, o.lng);
    return {
      ...o,
      distance: formatDistance(km),
      etaMinutes: estimateETA(km),
    };
  });
}

export const usePerformerStore = create<PerformerState>((set, get) => ({
  profile: mockPerformerProfile,
  isOnline: true,
  balance: 13500,
  pendingBalance: 7500,
  availableOrders: enrichWithDistance(mockAvailableOrders, mockPerformerProfile),
  activeOrders: mockActiveOrders,
  completedOrders: mockCompletedOrders,
  earnings: mockEarnings,
  notifications: mockPerformerNotifications,
  bankCards: mockBankCards,
  withdrawHistory: mockWithdrawHistory,

  toggleOnline: () => set((s) => ({ isOnline: !s.isOnline })),

  acceptOrder: (orderId) => {
    const now = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

    // Try shared store first (real client orders)
    const sharedEntry = useSharedOrdersStore.getState().orders.find((o) => o.id === orderId);
    if (sharedEntry) {
      const { profile } = get();
      const result = useSharedOrdersStore.getState().acceptOrder(orderId, {
        id: profile.id,
        name: profile.name,
        phone: profile.phone,
        telegram: profile.telegram,
        rating: profile.rating,
        avatar: profile.avatar,
        jobsCompleted: profile.completedOrders,
      });
      if (result === "success") {
        const accepted: PerformerOrder = {
          id: sharedEntry.id,
          createdAt: sharedEntry.createdAt,
          scheduledDate: sharedEntry.scheduledDate,
          scheduledTime: sharedEntry.scheduledTime,
          status: "accepted",
          categoryName: sharedEntry.categoryName,
          serviceName: sharedEntry.serviceName,
          address: sharedEntry.address,
          priceTotal: sharedEntry.priceTotal,
          priceBreakdown: sharedEntry.priceBreakdown,
          duration: sharedEntry.duration,
          comment: sharedEntry.comment,
          client: { name: sharedEntry.clientName, phone: sharedEntry.clientPhone },
          timeline: [
            { id: "t1", label: "Заказ принят", time: now, completed: true },
            { id: "t2", label: "Еду к клиенту", time: "", completed: false },
            { id: "t3", label: "Работа выполняется", time: "", completed: false },
            { id: "t4", label: "Завершено", time: "", completed: false },
          ],
        };
        set((s) => ({
          activeOrders: [accepted, ...s.activeOrders],
        }));
      }
      return result;
    }

    // Fall back to mock order behavior
    set((s) => {
      const order = s.availableOrders.find((o) => o.id === orderId);
      if (!order) return s;
      const accepted: PerformerOrder = {
        ...order,
        status: "accepted",
        timeline: [
          { id: "t1", label: "Заказ принят", time: now, completed: true },
          { id: "t2", label: "Еду к клиенту", time: "", completed: false },
          { id: "t3", label: "Работа выполняется", time: "", completed: false },
          { id: "t4", label: "Завершено", time: "", completed: false },
        ],
      };
      return {
        availableOrders: s.availableOrders.filter((o) => o.id !== orderId),
        activeOrders: [accepted, ...s.activeOrders],
      };
    });
    return "success";
  },

  rejectOrder: (orderId) =>
    set((s) => ({
      availableOrders: s.availableOrders.filter((o) => o.id !== orderId),
    })),

  updateOrderStatus: (orderId, status) => {
    const now = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    const timelineLabel: Record<string, string> = {
      on_the_way: "Еду к клиенту",
      in_progress: "Работа выполняется",
      completed: "Завершено",
    };
    set((s) => {
      const order = s.activeOrders.find((o) => o.id === orderId);
      if (!order) return s;
      const updatedTimeline = order.timeline.map((t) =>
        t.label === timelineLabel[status] ? { ...t, time: now, completed: true } : t
      );
      const updatedOrder: PerformerOrder = { ...order, status, timeline: updatedTimeline };

      if (status === "completed") {
        const earningsRecord: EarningsRecord = {
          id: `e-${Date.now()}`,
          orderId: order.id,
          serviceName: order.serviceName,
          amount: order.priceTotal,
          date: new Date().toISOString().split("T")[0],
          time: now,
        };
        return {
          activeOrders: s.activeOrders.filter((o) => o.id !== orderId),
          completedOrders: [updatedOrder, ...s.completedOrders],
          earnings: [earningsRecord, ...s.earnings],
          pendingBalance: s.pendingBalance + order.priceTotal,
          profile: { ...s.profile, completedOrders: s.profile.completedOrders + 1 },
        };
      }
      return { activeOrders: s.activeOrders.map((o) => (o.id === orderId ? updatedOrder : o)) };
    });
  },

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  updateProfile: (data) =>
    set((s) => {
      const updated = { ...s.profile, ...data };
      return {
        profile: updated,
        availableOrders: enrichWithDistance(s.availableOrders, updated),
      };
    }),

  withdraw: (amount, cardId) =>
    set((s) => {
      if (amount > s.balance) return s;
      const card = s.bankCards.find((c) => c.id === cardId);
      const now = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
      const record: WithdrawRecord = {
        id: `w-${Date.now()}`,
        amount,
        cardLast4: card?.last4 ?? "????",
        date: new Date().toISOString().split("T")[0],
        time: now,
        status: "completed",
      };
      return {
        balance: s.balance - amount,
        withdrawHistory: [record, ...s.withdrawHistory],
      };
    }),

  addBankCard: (card) =>
    set((s) => ({
      bankCards: [...s.bankCards, { ...card, id: `card-${Date.now()}` }],
    })),

  removeBankCard: (id) =>
    set((s) => ({ bankCards: s.bankCards.filter((c) => c.id !== id) })),

  setDefaultCard: (id) =>
    set((s) => ({
      bankCards: s.bankCards.map((c) => ({ ...c, isDefault: c.id === id })),
    })),
}));
