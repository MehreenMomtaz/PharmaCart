import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useOrderStore = create((set) => ({
  // Order History
  orders: [],
  selectedOrder: null,
  isLoadingOrders: false,
  isCreatingOrder: false,

  // Fetch user's order history
  fetchUserOrders: async () => {
    set({ isLoadingOrders: true });
    try {
      const res = await axiosInstance.get("/orders");
      set({ orders: res.data });
    } catch (error) {
      console.log("Error fetching orders:", error);
      toast.error("Failed to load order history");
    } finally {
      set({ isLoadingOrders: false });
    }
  },

  // Get order by ID
  fetchOrderById: async (id) => {
    try {
      const res = await axiosInstance.get(`/orders/${id}`);
      set({ selectedOrder: res.data });
      return res.data;
    } catch (error) {
      console.log("Error fetching order:", error);
      toast.error("Failed to load order details");
    }
  },

  // Create new order
  createOrder: async (orderData) => {
    set({ isCreatingOrder: true });
    try {
      const res = await axiosInstance.post("/orders", orderData);
      set((state) => ({
        orders: [res.data, ...state.orders],
      }));
      return res.data;
    } catch (error) {
      console.log("Error creating order:", error);
      toast.error(error.response?.data?.message || "Failed to create order");
      throw error;
    } finally {
      set({ isCreatingOrder: false });
    }
  },

  initiateSslCommerz: async (orderId) => {
    const res = await axiosInstance.post(
      `/orders/${orderId}/payment/sslcommerz`,
    );
    return res.data;
  },

  // Clear selected order
  clearSelectedOrder: () => {
    set({ selectedOrder: null });
  },
}));
