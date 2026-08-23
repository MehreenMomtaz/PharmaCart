import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlogStore } from '../store/useBlogStore';
import { 
    ArrowLeft,
    Calendar, 
    Clock, 
    Eye, 
    User,
    Share2,
    BookOpen,
    Tag
} from 'lucide-react';

const BlogDetailPage = () => {
    const { id } = useParams();
    const { currentBlog, isLoading, fetchBlogById, clearCurrentBlog } = useBlogStore();

    useEffect(() => {
        if (id) {
            fetchBlogById(id);
        }
        return () => clearCurrentBlog();
    }, [id, fetchBlogById, clearCurrentBlog]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatContent = (content) => {
        // Simple formatting - split by double newlines for paragraphs
        return content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4 leading-relaxed">
                {paragraph}
            </p>
        ));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
                        <div className="h-64 bg-gray-300 rounded-xl mb-8"></div>
                        <div className="max-w-4xl mx-auto">
                            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-4 bg-gray-300 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentBlog) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Article not found</h3>
                        <p className="text-gray-600 mb-6">
                            The article you're looking for doesn't exist or has been removed.
                        </p>
                        <Link 
                            to="/blog"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Browse All Articles
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6">
                    <Link 
                        to="/blog" 
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Articles
                    </Link>
                </div>

                {/* Hero Image */}
                <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
                    <img
                        src={currentBlog.image}
                        alt={currentBlog.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                        <div className="p-8">
                            <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 inline-block">
                                {currentBlog.category}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                {currentBlog.title}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Article Content */}
                <div className="max-w-4xl mx-auto">
                    {/* Article Meta */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <div className="flex flex-wrap items-center gap-6 text-gray-600">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                <span>By {currentBlog.author.fullName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>{formatDate(currentBlog.publishedAt || currentBlog.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>{currentBlog.readTime} min read</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                <span>{currentBlog.views} views</span>
                            </div>
                        </div>

                        {/* Tags */}
                        {currentBlog.tags && currentBlog.tags.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Tag className="w-4 h-4 text-gray-500" />
                                    {currentBlog.tags.map(tag => (
                                        <span 
                                            key={tag}
                                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Article Excerpt */}
                    <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
                        <p className="text-lg text-blue-900 italic">
                            {currentBlog.excerpt}
                        </p>
                    </div>

                    {/* Article Content */}
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                        <div className="prose prose-lg max-w-none">
                            <div className="text-gray-800 leading-relaxed">
                                {formatContent(currentBlog.content)}
                            </div>
                        </div>
                    </div>



                    {/* Disclaimer */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                            Medical Disclaimer
                        </h4>
                        <p className="text-yellow-700 text-sm">
                            This article is for informational purposes only and should not be considered as medical advice. 
                            Always consult with a qualified healthcare professional before making any medical decisions or 
                            changing your medication regimen.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetailPage;
