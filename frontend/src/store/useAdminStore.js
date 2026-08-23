import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useAdminStore = create((set) => ({
    // Dashboard Stats
    dashboardStats: null,
    isLoadingStats: false,

    // Medicines Management
    medicines: [],
    isLoadingMedicines: false,
    isCreatingMedicine: false,
    isUpdatingMedicine: false,
    isDeletingMedicine: false,

    // Orders Management
    orders: [],
    selectedOrder: null,
    isLoadingOrders: false,
    isUpdatingOrder: false,

    // Dashboard Stats
    fetchDashboardStats: async (range = '30d') => {
        set({ isLoadingStats: true });
        try {
            const res = await axiosInstance.get('/admin/dashboard', { params: { range } });
            set({ dashboardStats: res.data });
        } catch (error) {
            console.log('Error fetching dashboard stats:', error);
            toast.error('Failed to load dashboard stats');
        } finally {
            set({ isLoadingStats: false });
        }
    },

    // Medicine Management
    fetchMedicines: async () => {
        set({ isLoadingMedicines: true });
        try {
            const res = await axiosInstance.get('/admin/medicines');
            set({ medicines: res.data });
        } catch (error) {
            console.log('Error fetching medicines:', error);
            toast.error('Failed to load medicines');
        } finally {
            set({ isLoadingMedicines: false });
        }
    },

    createMedicine: async (medicineData) => {
        set({ isCreatingMedicine: true });
        try {
            const res = await axiosInstance.post('/admin/medicines', medicineData);
            set(state => ({ 
                medicines: [res.data, ...state.medicines] 
            }));
            toast.success('Medicine created successfully');
            return res.data;
        } catch (error) {
            console.log('Error creating medicine:', error);
            toast.error(error.response?.data?.message || 'Failed to create medicine');
            throw error;
        } finally {
            set({ isCreatingMedicine: false });
        }
    },

    updateMedicine: async (id, medicineData) => {
        set({ isUpdatingMedicine: true });
        try {
            const res = await axiosInstance.put(`/admin/medicines/${id}`, medicineData);
            set(state => ({
                medicines: state.medicines.map(medicine => 
                    medicine._id === id ? res.data : medicine
                )
            }));
            toast.success('Medicine updated successfully');
            return res.data;
        } catch (error) {
            console.log('Error updating medicine:', error);
            toast.error(error.response?.data?.message || 'Failed to update medicine');
            throw error;
        } finally {
            set({ isUpdatingMedicine: false });
        }
    },

    deleteMedicine: async (id) => {
        set({ isDeletingMedicine: true });
        try {
            await axiosInstance.delete(`/admin/medicines/${id}`);
            set(state => ({
                medicines: state.medicines.filter(medicine => medicine._id !== id)
            }));
            toast.success('Medicine deleted successfully');
        } catch (error) {
            console.log('Error deleting medicine:', error);
            toast.error(error.response?.data?.message || 'Failed to delete medicine');
        } finally {
            set({ isDeletingMedicine: false });
        }
    },

    updateInventory: async (id, quantityAvailable) => {
        try {
            const res = await axiosInstance.put(`/admin/medicines/${id}/inventory`, {
                quantityAvailable
            });
            set(state => ({
                medicines: state.medicines.map(medicine => 
                    medicine._id === id ? res.data : medicine
                )
            }));
            toast.success('Inventory updated successfully');
        } catch (error) {
            console.log('Error updating inventory:', error);
            toast.error('Failed to update inventory');
        }
    },

    // Order Management
    fetchOrders: async () => {
        set({ isLoadingOrders: true });
        try {
            const res = await axiosInstance.get('/admin/orders');
            set({ orders: res.data });
        } catch (error) {
            console.log('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            set({ isLoadingOrders: false });
        }
    },

    fetchOrderById: async (id) => {
        try {
            const res = await axiosInstance.get(`/admin/orders/${id}`);
            set({ selectedOrder: res.data });
            return res.data;
        } catch (error) {
            console.log('Error fetching order:', error);
            toast.error('Failed to load order details');
        }
    },

    updateOrderStatus: async (id, status, notes = '') => {
        set({ isUpdatingOrder: true });
        try {
            const res = await axiosInstance.put(`/admin/orders/${id}/status`, {
                status,
                notes
            });
            
            set(state => ({
                orders: state.orders.map(order => 
                    order._id === id ? res.data : order
                ),
                selectedOrder: state.selectedOrder?._id === id ? res.data : state.selectedOrder
            }));
            
            // Add delivery update notification using the notification store
            const { useNotificationStore } = await import('./useNotificationStore');
            useNotificationStore.getState().addDeliveryUpdate(res.data, status);
            
            toast.success('Order status updated successfully');
        } catch (error) {
            console.log('Error updating order status:', error);
            toast.error('Failed to update order status');
        } finally {
            set({ isUpdatingOrder: false });
        }
    },

    approveOrder: async (id, notes = '') => {
        set({ isUpdatingOrder: true });
        try {
            const res = await axiosInstance.put(`/admin/orders/${id}/approve`, {
                notes
            });
            set(state => ({
                orders: state.orders.map(order => 
                    order._id === id ? res.data : order
                ),
                selectedOrder: state.selectedOrder?._id === id ? res.data : state.selectedOrder
            }));
            
            // Add delivery update notification
            const { useNotificationStore } = await import('./useNotificationStore');
            useNotificationStore.getState().addDeliveryUpdate(res.data, 'confirmed');
            
            toast.success('Order approved successfully');
        } catch (error) {
            console.log('Error approving order:', error);
            toast.error('Failed to approve order');
        } finally {
            set({ isUpdatingOrder: false });
        }
    },

    rejectOrder: async (id, notes = '') => {
        set({ isUpdatingOrder: true });
        try {
            const res = await axiosInstance.put(`/admin/orders/${id}/reject`, {
                notes
            });
            set(state => ({
                orders: state.orders.map(order => 
                    order._id === id ? res.data : order
                ),
                selectedOrder: state.selectedOrder?._id === id ? res.data : state.selectedOrder
            }));
            toast.success('Order rejected');
        } catch (error) {
            console.log('Error rejecting order:', error);
            toast.error('Failed to reject order');
        } finally {
            set({ isUpdatingOrder: false });
        }
    },

    completeOrder: async (id, notes = '') => {
        set({ isUpdatingOrder: true });
        try {
            const res = await axiosInstance.put(`/admin/orders/${id}/complete`, {
                notes
            });
            set(state => ({
                orders: state.orders.map(order => 
                    order._id === id ? res.data : order
                ),
                selectedOrder: state.selectedOrder?._id === id ? res.data : state.selectedOrder
            }));
            toast.success('Order completed successfully');
        } catch (error) {
            console.log('Error completing order:', error);
            toast.error(error.response?.data?.message || 'Failed to complete order');
        } finally {
            set({ isUpdatingOrder: false });
        }
    }
}));
