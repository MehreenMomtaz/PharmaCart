import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    costPrice: {
        type: Number,
        min: 0
    },
    quantityAvailable: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&h=400&fit=crop&crop=center'
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Pain Relief',
            'Antibiotics', 
            'Vitamins & Supplements',
            'Heart & Blood Pressure',
            'Diabetes Care',
            'Cold & Flu',
            'Digestive Health',
            'Skin Care',
            'Eye Care',
            'Women\'s Health',
            'Men\'s Health',
            'Child Care',
            'Mental Health',
            'Respiratory',
            'Other'
        ]
    },
    manufacturer: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date
    },
    requiresPrescription: {
        type: Boolean,
        default: false
    },
    activeIngredient: {
        type: String
    },
    dosage: {
        type: String
    },
    dosageForm: {
        type: String,
        enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Other']
    },
    strength: {
        type: String
    },
    sideEffects: {
        type: String
    },
    warnings: {
        type: String
    },
    inStock: {
        type: Boolean,
        default: true
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});


medicineSchema.pre('save', function(next) {
    if (this.quantityAvailable <= 0) this.inStock = false;
    else if (this.isModified('quantityAvailable')) this.inStock = true;
    next();
});

// Index for better search performance
medicineSchema.index({ name: 'text', description: 'text', category: 'text' });

const Medicine = mongoose.model("Medicine", medicineSchema);

export default Medicine;
