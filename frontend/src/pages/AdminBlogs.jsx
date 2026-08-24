import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBlogStore } from "../store/useBlogStore";
import { useAuthStore } from "../store/useAuthStore";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Star,
  Search,
  Filter,
  ArrowLeft,
} from "lucide-react";

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
    updateFilters,
  } = useBlogStore();

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (authUser?.role === "admin") {
      // Fetch all blogs including unpublished ones for admin
      fetchBlogs({ published: "false" });
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
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      await deleteBlog(id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (authUser?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f8f7] px-3 pb-16 pt-[84px] sm:px-6 sm:pt-[104px]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <section className="relative mb-6 overflow-hidden rounded-[30px] bg-[#062e28] px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="absolute -right-20 -top-32 size-80 rounded-full border border-white/10" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link
                to="/admin"
                className="mb-6 inline-flex items-center gap-2 text-sm text-[#65d6b4]"
              >
                <ArrowLeft className="size-4" />
                Back to dashboard
              </Link>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[.18em] text-[#65d6b4]">
                  Health library
                </span>
                <h1 className="mt-3 text-5xl font-semibold tracking-[-.055em]">
                  Blog management
                </h1>
                <p className="mt-3 text-white/60">
                  Create and manage trusted health tips and articles.
                </p>
              </div>
            </div>
            <Link
              to="/admin/blogs/new"
              className="relative flex min-h-12 items-center gap-2 rounded-full bg-[#65d6b4] px-6 font-semibold text-[#062e28] transition hover:bg-[#7de0c1]"
            >
              <Plus className="w-5 h-5" />
              New Article
            </Link>
          </div>
        </section>

        {/* Search and Filters */}
        <div className="mb-6 rounded-[24px] border border-[#e2ebe7] bg-white p-3 shadow-[0_16px_45px_rgba(7,63,53,.06)]">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-14 w-full rounded-2xl bg-[#f5f8f7] pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#65d6b4]/50"
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </form>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={filters.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="h-14 w-full rounded-2xl border border-[#dce7e3] bg-white px-4 outline-none focus:ring-2 focus:ring-[#65d6b4]/50"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Blog List */}
        <div className="overflow-hidden rounded-[28px] border border-[#e2ebe7] bg-white shadow-[0_18px_55px_rgba(7,63,53,.07)]">
          {isLoading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 border-b border-gray-200"
                  >
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
              {blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="p-6 transition-colors hover:bg-[#f8fbfa]"
                >
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
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              blog.isPublished
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {blog.isPublished ? "Published" : "Draft"}
                          </span>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/blog/${blog._id}`}
                              className="grid size-10 place-items-center rounded-full bg-[#effbf7] text-[#087558] transition hover:bg-[#dff8ef]"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/admin/blogs/${blog._id}/edit`}
                              className="grid size-10 place-items-center rounded-full bg-[#effbf7] text-[#087558] transition hover:bg-[#dff8ef]"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(blog._id)}
                              disabled={isDeleting}
                              className="grid size-10 place-items-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 mb-6">
                Start creating health tips and articles for your users
              </p>
              <Link
                to="/admin/blogs/new"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#159a74] px-6 font-semibold text-white transition hover:bg-[#087558]"
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
              onClick={() =>
                updateFilters({ page: pagination.currentPage - 1 })
              }
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="px-4 py-2 text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() =>
                updateFilters({ page: pagination.currentPage + 1 })
              }
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminBlogs;
