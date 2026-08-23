import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBlogStore } from '../store/useBlogStore';
import { useAuthStore } from '../store/useAuthStore';
import { 
    Plus,
    Edit3, 
    Trash2, 
    Eye,
    Calendar,
    Clock,
    Star,
    Search,
    Filter
} from 'lucide-react';

const AdminBlogs = () => {
    const { authUser } = useAuthStore();
    const {
        blogs,
        categories,
        isLoading,
        isDeleting,
        pagination,
        filters,
        fetchBlogs,
        fetchCategories,
        deleteBlog,
        updateFilters
    } = useBlogStore();

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (authUser?.role === 'admin') {
            // Fetch all blogs including unpublished ones for admin
            fetchBlogs({ published: 'false' });
            fetchCategories();
        }
    }, [authUser, fetchBlogs, fetchCategories]);

    const handleSearch = (e) => {
        e.preventDefault();
        updateFilters({ search: searchTerm, page: 1 });
    };

    const handleCategoryChange = (category) => {
        updateFilters({ category, page: 1 });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this blog post?')) {
            await deleteBlog(id);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (authUser?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                        <p className="text-gray-600">You don't have permission to access this page.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
                        <p className="text-gray-600">Manage health tips and articles</p>
                    </div>
                    <Link
                        to="/admin/blogs/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        New Article
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            </div>
                        </form>

                        {/* Category Filter */}
                        <div className="md:w-64">
                            <select
                                value={filters.category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Blog List */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {isLoading ? (
                        <div className="p-8">
                            <div className="animate-pulse space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-200">
                                        <div className="w-24 h-16 bg-gray-300 rounded"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : blogs.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {blogs.map(blog => (
                                <div key={blog._id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        {/* Blog Image */}
                                        <img
                                            src={blog.image}
                                            alt={blog.title}
                                            className="w-24 h-16 object-cover rounded-lg"
                                        />

                                        {/* Blog Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                        {blog.title}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-2">
                                                        {blog.excerpt}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                            {blog.category}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {formatDate(blog.createdAt)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {blog.readTime} min
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="w-4 h-4" />
                                                            {blog.views}
                                                        </span>
                                                        {blog.featured && (
                                                            <span className="flex items-center gap-1 text-yellow-600">
                                                                <Star className="w-4 h-4 fill-current" />
                                                                Featured
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        blog.isPublished 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {blog.isPublished ? 'Published' : 'Draft'}
                                                    </span>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            to={`/blog/${blog._id}`}
                                                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            to={`/admin/blogs/${blog._id}/edit`}
                                                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(blog._id)}
                                                            disabled={isDeleting}
                                                            className="p-2 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <Plus className="w-16 h-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
                            <p className="text-gray-600 mb-6">
                                Start creating health tips and articles for your users
                            </p>
                            <Link
                                to="/admin/blogs/new"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Create First Article
                            </Link>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            onClick={() => updateFilters({ page: pagination.currentPage - 1 })}
                            disabled={!pagination.hasPrev}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        
                        <span className="px-4 py-2 text-gray-600">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        
                        <button
                            onClick={() => updateFilters({ page: pagination.currentPage + 1 })}
                            disabled={!pagination.hasNext}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBlogs;
