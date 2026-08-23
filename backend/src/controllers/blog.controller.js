import Blog from "../models/blog.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeTags = (tags) => Array.isArray(tags)
    ? [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))]
    : [];

// Create a new blog post (Admin only)
export const createBlog = async (req, res) => {
    try {
        const { title, content, excerpt, category, image, tags, isPublished, readTime, featured } = req.body;
        const authorId = req.user._id;

        // Calculate read time if not provided (rough estimate: 200 words per minute)
        let calculatedReadTime = readTime;
        if (!readTime) {
            const wordCount = content.split(' ').length;
            calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200));
        }

        const normalizedTags = normalizeTags(tags);
        if (normalizedTags.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Add at least one specific topic tag'
            });
        }

        const blog = new Blog({
            title,
            content,
            excerpt,
            category,
            image,
            author: authorId,
            tags: normalizedTags,
            isPublished: isPublished || false,
            readTime: calculatedReadTime,
            featured: featured || false
        });

        await blog.save();

        // Populate author data for response
        const populatedBlog = await Blog.findById(blog._id)
            .populate('author', 'fullName email');

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            blog: populatedBlog
        });
    } catch (error) {
        console.error("Error in createBlog controller:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get all blog posts (public)
export const getAllBlogs = async (req, res) => {
    try {
        const { 
            category, 
            search, 
            tag,
            page = 1, 
            limit = 12, 
            featured,
            published = 'true' 
        } = req.query;
        
        let query = {};
        
        // Only show published blogs for public access
        if (String(published) !== 'false') {
            query.isPublished = true;
        }
        
        // Add category filter if provided
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Add featured filter if provided
        if (featured === 'true') {
            query.featured = true;
        }

        // Topic filtering is deliberately exact, so common words do not return
        // every article that happens to contain them.
        if (tag) {
            const exactTag = new RegExp(`^${escapeRegex(String(tag).trim())}$`, 'i');
            query.tags = exactTag;
        }
        
        // Prefer an exact title/tag match. Fall back to a focused metadata
        // search and intentionally avoid full article content.
        const normalizedSearch = typeof search === 'string' ? search.trim() : '';
        if (normalizedSearch && !tag) {
            const escapedSearch = escapeRegex(normalizedSearch);
            const exactPattern = new RegExp(`^${escapedSearch}$`, 'i');
            const exactMatchExists = await Blog.exists({
                ...query,
                $or: [{ title: exactPattern }, { tags: exactPattern }]
            });

            query.$or = exactMatchExists
                ? [{ title: exactPattern }, { tags: exactPattern }]
                : [
                    { title: { $regex: escapedSearch, $options: 'i' } },
                    { excerpt: { $regex: escapedSearch, $options: 'i' } },
                    { category: { $regex: escapedSearch, $options: 'i' } },
                    { tags: { $regex: escapedSearch, $options: 'i' } }
                ];
        }
        
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;
        
        const blogs = await Blog.find(query)
            .populate('author', 'fullName')
            .select('-content') // Exclude full content for list view
            .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);
            
        const totalBlogs = await Blog.countDocuments(query);
        const totalPages = Math.ceil(totalBlogs / limitNumber);
        
        res.status(200).json({
            success: true,
            blogs,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalBlogs,
                hasNext: pageNumber < totalPages,
                hasPrev: pageNumber > 1
            }
        });
    } catch (error) {
        console.error("Error in getAllBlogs controller:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get single blog post by ID
export const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const blog = await Blog.findById(id)
            .populate('author', 'fullName email');
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog post not found"
            });
        }

        // Increment view count
        blog.views += 1;
        await blog.save();
        
        res.status(200).json({
            success: true,
            blog
        });
    } catch (error) {
        console.error("Error in getBlogById controller:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Update blog post (Admin only)
export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (Object.prototype.hasOwnProperty.call(updates, 'tags')) {
            updates.tags = normalizeTags(updates.tags);
            if (updates.tags.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Add at least one specific topic tag'
                });
            }
        }
        
        // Calculate read time if content is updated
        if (updates.content && !updates.readTime) {
            const wordCount = updates.content.split(' ').length;
            updates.readTime = Math.max(1, Math.ceil(wordCount / 200));
        }

        if (updates.isPublished === true && !updates.publishedAt) {
            updates.publishedAt = new Date();
        }

        const blog = await Blog.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('author', 'fullName email');
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog post not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Blog post updated successfully',
            blog
        });
    } catch (error) {
        console.error("Error in updateBlog controller:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Delete blog post (Admin only)
export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        
        const blog = await Blog.findByIdAndDelete(id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog post not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (error) {
        console.error("Error in deleteBlog controller:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get blog categories
export const getBlogCategories = async (req, res) => {
    try {
        const categories = await Blog.distinct('category');
        
        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        console.error("Error in getBlogCategories controller:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get exact topic tags used by published blogs
export const getBlogTags = async (req, res) => {
    try {
        const tags = await Blog.distinct('tags', { isPublished: true });
        res.status(200).json({
            success: true,
            tags: tags.filter(Boolean).sort((a, b) => a.localeCompare(b))
        });
    } catch (error) {
        console.error("Error in getBlogTags controller:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get featured blog posts
export const getFeaturedBlogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        
        const blogs = await Blog.find({ 
            isPublished: true, 
            featured: true 
        })
            .populate('author', 'fullName')
            .select('-content')
            .sort({ publishedAt: -1, createdAt: -1 })
            .limit(limit);
        
        res.status(200).json({
            success: true,
            blogs
        });
    } catch (error) {
        console.error("Error in getFeaturedBlogs controller:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};
