import { create } from "zustand";
import type { AdminRole, AdminStats, AdminOrder, AdminPerformer, AdminDispute, AdminClient } from "../types";
import {
  adminLoadStats,
  adminLoadOrders,
  adminLoadPerformers,
  adminLoadDisputes,
  adminLoadClients,
  adminUpdateOrderStatus,
  adminCancelOrder,
  adminGetUserRole,
} from "../lib/adminDb";

interface AdminState {
  role: AdminRole | null;
  isLoadingRole: boolean;

  stats: AdminStats | null;
  orders: AdminOrder[];
  performers: AdminPerformer[];
  disputes: AdminDispute[];
  clients: AdminClient[];

  isLoadingStats: boolean;
  isLoadingOrders: boolean;
  isLoadingPerformers: boolean;
  isLoadingDisputes: boolean;
  isLoadingClients: boolean;

  loadRole: (userId: string) => Promise<void>;
  loadStats: () => Promise<void>;
  loadOrders: (statusFilter?: string) => Promise<void>;
  loadPerformers: () => Promise<void>;
  loadDisputes: () => Promise<void>;
  loadClients: () => Promise<void>;

  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  role: null,
  isLoadingRole: true,
  stats: null,
  orders: [],
  performers: [],
  disputes: [],
  clients: [],
  isLoadingStats: false,
  isLoadingOrders: false,
  isLoadingPerformers: false,
  isLoadingDisputes: false,
  isLoadingClients: false,

  loadRole: async (userId) => {
    set({ isLoadingRole: true });
    const role = await adminGetUserRole(userId);
    set({ role: role as AdminRole | null, isLoadingRole: false });
  },

  loadStats: async () => {
    set({ isLoadingStats: true });
    const stats = await adminLoadStats();
    set({ stats, isLoadingStats: false });
  },

  loadOrders: async (statusFilter) => {
    set({ isLoadingOrders: true });
    const orders = await adminLoadOrders(statusFilter);
    set({ orders, isLoadingOrders: false });
  },

  loadPerformers: async () => {
    set({ isLoadingPerformers: true });
    const performers = await adminLoadPerformers();
    set({ performers, isLoadingPerformers: false });
  },

  loadDisputes: async () => {
    set({ isLoadingDisputes: true });
    const disputes = await adminLoadDisputes();
    set({ disputes, isLoadingDisputes: false });
  },

  loadClients: async () => {
    set({ isLoadingClients: true });
    const clients = await adminLoadClients();
    set({ clients, isLoadingClients: false });
  },

  updateOrderStatus: async (orderId, status) => {
    await adminUpdateOrderStatus(orderId, status);
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    }));
  },

  cancelOrder: async (orderId) => {
    await adminCancelOrder(orderId);
    set((s) => ({
      orders: s.orders.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)),
    }));
  },

}));
