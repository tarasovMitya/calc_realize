import { create } from "zustand";
import type { AffiliatePerformer, AffiliateOrder, AffiliateEarning, AffiliateTask, AffiliateStats } from "../types";
import {
  affiliateLoadStats,
  affiliateLoadPerformers,
  affiliateLoadOrders,
  affiliateLoadEarnings,
  affiliateLoadTasks,
  affiliateMarkTaskDone,
  affiliateUnmarkTask,
} from "../lib/affiliateDb";

interface AffiliateState {
  userId: string | null;
  stats: AffiliateStats | null;
  performers: AffiliatePerformer[];
  orders: AffiliateOrder[];
  earnings: AffiliateEarning[];
  tasks: AffiliateTask[];

  isLoadingStats: boolean;
  isLoadingPerformers: boolean;
  isLoadingOrders: boolean;
  isLoadingEarnings: boolean;
  isLoadingTasks: boolean;

  setUserId: (id: string) => void;
  loadStats: () => Promise<void>;
  loadPerformers: () => Promise<void>;
  loadOrders: (statusFilter?: string) => Promise<void>;
  loadEarnings: () => Promise<void>;
  loadTasks: () => Promise<void>;
  markTaskDone: (taskId: string) => Promise<void>;
  unmarkTask: (taskId: string) => Promise<void>;
}

export const useAffiliateStore = create<AffiliateState>((set, get) => ({
  userId: null,
  stats: null,
  performers: [],
  orders: [],
  earnings: [],
  tasks: [],

  isLoadingStats: false,
  isLoadingPerformers: false,
  isLoadingOrders: false,
  isLoadingEarnings: false,
  isLoadingTasks: false,

  setUserId: (id) => set({ userId: id }),

  loadStats: async () => {
    const uid = get().userId;
    if (!uid) return;
    set({ isLoadingStats: true });
    const stats = await affiliateLoadStats(uid);
    set({ stats, isLoadingStats: false });
  },

  loadPerformers: async () => {
    const uid = get().userId;
    if (!uid) return;
    set({ isLoadingPerformers: true });
    const performers = await affiliateLoadPerformers(uid);
    set({ performers, isLoadingPerformers: false });
  },

  loadOrders: async (statusFilter) => {
    const uid = get().userId;
    if (!uid) return;
    set({ isLoadingOrders: true });
    const orders = await affiliateLoadOrders(uid, statusFilter);
    set({ orders, isLoadingOrders: false });
  },

  loadEarnings: async () => {
    const uid = get().userId;
    if (!uid) return;
    set({ isLoadingEarnings: true });
    const earnings = await affiliateLoadEarnings(uid);
    set({ earnings, isLoadingEarnings: false });
  },

  loadTasks: async () => {
    const uid = get().userId;
    if (!uid) return;
    set({ isLoadingTasks: true });
    const tasks = await affiliateLoadTasks(uid);
    set({ tasks, isLoadingTasks: false });
  },

  markTaskDone: async (taskId) => {
    const uid = get().userId;
    if (!uid) return;
    await affiliateMarkTaskDone(taskId, uid);
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, completedAt: new Date().toISOString() } : t
      ),
    }));
  },

  unmarkTask: async (taskId) => {
    const uid = get().userId;
    if (!uid) return;
    await affiliateUnmarkTask(taskId, uid);
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, completedAt: null } : t
      ),
    }));
  },
}));
