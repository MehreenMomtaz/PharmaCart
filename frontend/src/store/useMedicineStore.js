import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useMedicineStore = create((set, get) => ({
    medicines: [],
    categories: [],
    currentMedicine: null,
    isLoading: false,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalMedicines: 0,
        hasNext: false,
        hasPrev: false
    },
    filters: {
        category: 'all',
        search: '',
        page: 1
    },

    // Fetch all medicines
    fetchMedicines: async (filters = {}) => {
        set({ isLoading: true });
        try {
            const params = new URLSearchParams();
            
            if (filters.category && filters.category !== 'all') {
                params.append('category', filters.category);
            }
            if (filters.search) {
                params.append('search', filters.search);
            }
            if (filters.page) {
                params.append('page', filters.page);
            }
            
            const response = await axiosInstance.get(`/medicines?${params.toString()}`);
            
            if (response.data.success) {
                set({ 
                    medicines: response.data.medicines,
                    pagination: response.data.pagination,
                    filters: { ...get().filters, ...filters }
                });
            }
        } catch (error) {
            console.error('Error fetching medicines:', error);
            toast.error('Failed to fetch medicines');
        } finally {
            set({ isLoading: false });
        }
    },

    // Fetch medicine categories
    fetchCategories: async () => {
        try {
            const response = await axiosInstance.get('/medicines/categories');
            if (response.data.success) {
                set({ categories: response.data.categories });
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to fetch categories');
        }
    },

    // Fetch single medicine by ID
    fetchMedicineById: async (id) => {
        set({ isLoading: true });
        try {
            const response = await axiosInstance.get(`/medicines/${id}`);
            if (response.data.success) {
                set({ currentMedicine: response.data.medicine });
            }
        } catch (error) {
            console.error('Error fetching medicine:', error);
            toast.error('Failed to fetch medicine details');
        } finally {
            set({ isLoading: false });
        }
    },

    // Update filters
    updateFilters: (newFilters) => {
        const updatedFilters = { ...get().filters, ...newFilters };
        set({ filters: updatedFilters });
        get().fetchMedicines(updatedFilters);
    },

    // Clear current medicine
    clearCurrentMedicine: () => {
        set({ currentMedicine: null });
    },

    // Update a single medicine's rating (useful after review submission)
    updateMedicineRating: async (medicineId) => {
        try {
            const response = await axiosInstance.get(`/medicines/${medicineId}`);
            if (response.data.success) {
                const updatedMedicine = response.data.medicine;
                
                set(state => ({
                    medicines: state.medicines.map(medicine => 
                        medicine._id === medicineId ? updatedMedicine : medicine
                    ),
                    currentMedicine: state.currentMedicine?._id === medicineId 
                        ? updatedMedicine 
                        : state.currentMedicine
                }));
            }
        } catch (error) {
            console.error('Error updating medicine rating:', error);
        }
    },

    // Reset filters
    resetFilters: () => {
        const defaultFilters = { category: 'all', search: '', page: 1 };
        set({ filters: defaultFilters });
        get().fetchMedicines(defaultFilters);
    }
}));
