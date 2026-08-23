import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBlogStore } from '../store/useBlogStore';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowLeft, Save, Eye, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageDropzone from '../components/ImageDropzone';

const AddEditBlog = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { authUser } = useAuthStore();
    const { 
        currentBlog, 
        isCreating, 
        isUpdating, 
        fetchBlogById, 
        fetchCategories,
        createBlog, 
        updateBlog,
        clearCurrentBlog 
    } = useBlogStore();

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        category: 'Medicine Safety',
        image: '',
        tags: '',
        isPublished: true, // Auto-publish all articles
        featured: false,
        readTime: ''
    });

    const isEditing = Boolean(id);

    useEffect(() => {
        fetchCategories();
        
        if (isEditing && id) {
            fetchBlogById(id);
        } else {
            clearCurrentBlog();
        }
    }, [id, isEditing, fetchBlogById, fetchCategories, clearCurrentBlog]);

    useEffect(() => {
        if (isEditing && currentBlog) {
            setFormData({
                title: currentBlog.title || '',
                content: currentBlog.content || '',
                excerpt: currentBlog.excerpt || '',
                category: currentBlog.category || 'Medicine Safety',
                image: currentBlog.image || '',
                tags: currentBlog.tags ? currentBlog.tags.join(', ') : '',
                isPublished: currentBlog.isPublished !== undefined ? currentBlog.isPublished : true,
                featured: currentBlog.featured || false,
                readTime: currentBlog.readTime || ''
            });
        }
    }, [currentBlog, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const blogData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                readTime: formData.readTime ? parseInt(formData.readTime) : undefined
            };

            if (blogData.tags.length === 0) {
                toast.error('Add at least one specific topic tag');
                return;
            }

            if (isEditing) {
                await updateBlog(id, blogData);
            } else {
                await createBlog(blogData);
            }

            navigate('/admin/blogs');
        } catch (error) {
            console.error('Error saving blog:', error);
        }
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
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/admin/blogs')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Blogs
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditing ? 'Edit Article' : 'Create New Article'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Article Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="Enter article title..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                            />
                        </div>

                        {/* Excerpt */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Excerpt (Short Summary) *
                            </label>
                            <textarea
                                name="excerpt"
                                value={formData.excerpt}
                                onChange={handleChange}
                                required
                                rows={3}
                                maxLength={200}
                                placeholder="Brief description of the article (max 200 characters)..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                            />
                            <div className="text-right text-sm text-gray-500 mt-1">
                                {formData.excerpt.length}/200
                            </div>
                        </div>

                        {/* Content */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Article Content *
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                required
                                rows={20}
                                placeholder="Write your article content here. Use double line breaks for paragraphs..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-white text-gray-900 placeholder-gray-500"
                            />
                            <div className="text-sm text-gray-500 mt-2">
                                Tip: Use double line breaks (press Enter twice) to create new paragraphs
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Save Button */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isCreating || isUpdating}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {isCreating || isUpdating ? 'Saving...' : 'Save Article'}
                                </button>
                                
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/blog/${id}`)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Preview
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Category & Tags */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category & Tags</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                                    >
                                        <option value="Medicine Safety">Medicine Safety</option>
                                        <option value="Dosage Guidelines">Dosage Guidelines</option>
                                        <option value="Health Conditions">Health Conditions</option>
                                        <option value="Prevention & Wellness">Prevention & Wellness</option>
                                        <option value="Drug Interactions">Drug Interactions</option>
                                        <option value="Side Effects">Side Effects</option>
                                        <option value="Emergency Care">Emergency Care</option>
                                        <option value="General Health">General Health</option>
                                        <option value="Nutrition">Nutrition</option>
                                        <option value="Mental Health">Mental Health</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Specific topic tags * (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        placeholder="paracetamol dosage, diabetes diet, antibiotic safety"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        Use precise topics. Users can select one tag to find only matching articles.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Media & Meta */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Media & Meta</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <ImageDropzone
                                        label="Featured blog image"
                                        value={formData.image}
                                        onChange={(image) => setFormData((previous) => ({ ...previous, image }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Read Time (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        name="readTime"
                                        value={formData.readTime}
                                        onChange={handleChange}
                                        min="1"
                                        max="60"
                                        placeholder="Auto-calculated if empty"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                                    />
                                    <div className="text-sm text-gray-500 mt-1">
                                        Leave empty for auto-calculation
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditBlog;
