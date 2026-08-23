import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        required: true,
        maxlength: 200
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Medicine Safety',
            'Dosage Guidelines',
            'Health Conditions',
            'Prevention & Wellness',
            'Drug Interactions',
            'Side Effects',
            'Emergency Care',
            'General Health',
            'Nutrition',
            'Mental Health'
        ]
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop&crop=center'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date
    },
    readTime: {
        type: Number, // in minutes
        default: 5
    },
    views: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for better search performance
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogSchema.index({ category: 1, isPublished: 1, createdAt: -1 });

// Pre-save middleware to set publishedAt date
blogSchema.pre('save', function(next) {
    if (this.isPublished && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
