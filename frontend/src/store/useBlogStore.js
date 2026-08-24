import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useBlogStore = create((set, get) => ({
    blogs: [],
    currentBlog: null,
    featuredBlogs: [],
    categories: [],
    tags: [],
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalBlogs: 0,
        hasNext: false,
        hasPrev: false
    },
    filters: {
        category: 'all',
        tag: 'all',
        search: '',
        page: 1,
        featured: false
    },

    // Fetch all blogs
    fetchBlogs: async (filters = {}) => {
        set({ isLoading: true });
        try {
            const params = new URLSearchParams();
            
            if (filters.category && filters.category !== 'all') {
                params.append('category', filters.category);
            }
            if (filters.search) {
                params.append('search', filters.search);
            }
            if (filters.tag && filters.tag !== 'all') {
                params.append('tag', filters.tag);
            }
            if (filters.page) {
                params.append('page', filters.page);
            }
            if (filters.featured) {
                params.append('featured', 'true');
            }
            if (filters.published !== undefined) {
                params.append('published', filters.published);
            }
            
            const endpoint = filters.published === 'false' ? '/blogs/admin/all' : '/blogs';
            const response = await axiosInstance.get(`${endpoint}?${params.toString()}`);
            
            if (response.data.success) {
                set({ 
                    blogs: response.data.blogs,
                    pagination: response.data.pagination,
                    filters: { ...get().filters, ...filters }
                });
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            toast.error('Failed to fetch blog posts');
        } finally {
            set({ isLoading: false });
        }
    },

    // Fetch single blog by ID
    fetchBlogById: async (id) => {
        set({ isLoading: true });
        try {
            const response = await axiosInstance.get(`/blogs/${id}`);
            if (response.data.success) {
                set({ currentBlog: response.data.blog });
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
            toast.error('Failed to fetch blog post');
        } finally {
            set({ isLoading: false });
        }
    },

    // Fetch featured blogs
    fetchFeaturedBlogs: async (limit = 3) => {
        try {
            const response = await axiosInstance.get(`/blogs/featured?limit=${limit}`);
            if (response.data.success) {
                set({ featuredBlogs: response.data.blogs });
            }
        } catch (error) {
            console.error('Error fetching featured blogs:', error);
        }
    },

    // Fetch blog categories
    fetchCategories: async () => {
        try {
            const response = await axiosInstance.get('/blogs/categories');
            if (response.data.success) {
                set({ categories: response.data.categories });
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    },

    // Fetch precise topic tags for public filtering
    fetchTags: async () => {
        try {
            const response = await axiosInstance.get('/blogs/tags');
            if (response.data.success) {
                set({ tags: response.data.tags });
            }
        } catch (error) {
            console.error('Error fetching blog tags:', error);
        }
    },

    // Create new blog (Admin only)
    createBlog: async (blogData) => {
        set({ isCreating: true });
        try {
            const response = await axiosInstance.post('/blogs', blogData);
            if (response.data.success) {
                set(state => ({
                    blogs: [response.data.blog, ...state.blogs]
                }));
                toast.success('Blog post created successfully!');
                return response.data.blog;
            }
        } catch (error) {
            console.error('Error creating blog:', error);
            toast.error(error.response?.data?.message || 'Failed to create blog post');
            throw error;
        } finally {
            set({ isCreating: false });
        }
    },

    // Update blog (Admin only)
    updateBlog: async (id, blogData) => {
        set({ isUpdating: true });
        try {
            const response = await axiosInstance.put(`/blogs/${id}`, blogData);
            if (response.data.success) {
                set(state => ({
                    blogs: state.blogs.map(blog => 
                        blog._id === id ? response.data.blog : blog
                    ),
                    currentBlog: state.currentBlog?._id === id 
                        ? response.data.blog 
                        : state.currentBlog
                }));
                toast.success('Blog post updated successfully!');
                return response.data.blog;
            }
        } catch (error) {
            console.error('Error updating blog:', error);
            toast.error(error.response?.data?.message || 'Failed to update blog post');
            throw error;
        } finally {
            set({ isUpdating: false });
        }
    },

    // Delete blog (Admin only)
    deleteBlog: async (id) => {
        set({ isDeleting: true });
        try {
            const response = await axiosInstance.delete(`/blogs/${id}`);
            if (response.data.success) {
                set(state => ({
                    blogs: state.blogs.filter(blog => blog._id !== id)
                }));
                toast.success('Blog post deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            toast.error(error.response?.data?.message || 'Failed to delete blog post');
            throw error;
        } finally {
            set({ isDeleting: false });
        }
    },

    // Update filters
    updateFilters: (newFilters) => {
        const updatedFilters = { ...get().filters, ...newFilters };
        set({ filters: updatedFilters });
        get().fetchBlogs(updatedFilters);
    },

    // Clear current blog
    clearCurrentBlog: () => {
        set({ currentBlog: null });
    },

    // Reset filters
    resetFilters: () => {
        const defaultFilters = { category: 'all', tag: 'all', search: '', page: 1, featured: false };
        set({ filters: defaultFilters });
        get().fetchBlogs(defaultFilters);
    }
}));
