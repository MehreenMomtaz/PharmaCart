import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMedicineStore } from '../store/useMedicineStore';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import StarRating from '../components/StarRating';
import ReviewsSection from '../components/ReviewsSection';
import toast from 'react-hot-toast';
import { 
    ShoppingCart, 
    ArrowLeft, 
    Package, 
    Shield, 
    Truck, 
    Heart,
    Plus,
    Minus,
    AlertCircle,
    CheckCircle,
    Star
} from 'lucide-react';

const MedicineDetailPage = () => {
    const { id } = useParams();
    const { authUser } = useAuthStore();
    const { currentMedicine, fetchMedicineById, updateMedicineRating, isLoading } = useMedicineStore();
    const { addToCart } = useCartStore();
    
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    useEffect(() => {
        if (id) {
            fetchMedicineById(id);
        }
    }, [id, fetchMedicineById]);

    const handleAddToCart = async () => {
        if (!authUser) {
            toast.error('Please login to add items to cart');
            return;
        }

        setIsAddingToCart(true);
        try {
            await addToCart(currentMedicine, quantity);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    if (isLoading || !currentMedicine) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="h-96 bg-gray-300 rounded-xl"></div>
                            <div className="space-y-4">
                                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                                <div className="h-20 bg-gray-300 rounded"></div>
                                <div className="h-12 bg-gray-300 rounded w-1/3"></div>
                            </div>
                        </div>
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
                        to="/" 
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Medicines
                    </Link>
                </div>

                {/* Main Product Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Product Image */}
                        <div className="flex justify-center">
                            <div className="w-full max-w-md">
                                <img
                                    src={currentMedicine.image || '/api/placeholder/400/400'}
                                    alt={currentMedicine.name}
                                    className="w-full h-96 object-cover rounded-xl shadow-md"
                                />
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {currentMedicine.name}
                                </h1>
                                


                                {/* Price */}
                                <div className="text-3xl font-bold text-blue-600 mb-4">
                                    {formatPrice(currentMedicine.price)}
                                </div>

                                {/* Stock Status */}
                                <div className="flex items-center gap-2 mb-4">
                                    {currentMedicine.quantityAvailable > 0 ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <span className="text-green-600 font-medium">
                                                In Stock ({currentMedicine.quantityAvailable} available)
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                            <span className="text-red-600 font-medium">
                                                Out of Stock
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            {currentMedicine.description && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Description
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {currentMedicine.description}
                                    </p>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Quantity
                                </h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-4 py-2 border border-gray-300 rounded-lg min-w-16 text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(Math.min(currentMedicine.quantityAvailable, quantity + 1))}
                                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        disabled={quantity >= currentMedicine.quantityAvailable}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={currentMedicine.quantityAvailable === 0 || isAddingToCart}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                                </button>
                                
                                <button className="p-3 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors">
                                    <Heart className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Shield className="w-5 h-5 text-green-500" />
                                    <span className="text-sm">Quality Assured</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Truck className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm">Fast Delivery</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Package className="w-5 h-5 text-purple-500" />
                                    <span className="text-sm">Secure Packaging</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <ReviewsSection 
                    medicineId={currentMedicine._id} 
                    medicineName={currentMedicine.name}
                    onRatingUpdated={() => {
                        // Refresh this medicine's data when rating is updated
                        updateMedicineRating(currentMedicine._id);
                    }}
                />
            </div>
        </div>
    );
};

export default MedicineDetailPage;
