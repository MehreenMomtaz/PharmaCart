import { useCartStore } from '../store/useCartStore';
import { X, Plus, Minus } from 'lucide-react';

const QuickCartItem = ({ medicine, onClose }) => {
    const { updateQuantity, removeFromCart, getItemQuantity } = useCartStore();
    const quantity = getItemQuantity(medicine._id);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(medicine._id);
            onClose();
        } else {
            updateQuantity(medicine._id, newQuantity);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-sm z-50 animate-slide-up">
            <div className="flex items-start gap-3">
                <img
                    src={medicine.image}
                    alt={medicine.name}
                    className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                            {medicine.name}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-green-600 font-semibold">
                            {formatPrice(medicine.price)}
                        </span>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleQuantityChange(quantity - 1)}
                                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-semibold text-sm">
                                {quantity}
                            </span>
                            <button
                                onClick={() => handleQuantityChange(quantity + 1)}
                                disabled={quantity >= medicine.quantityAvailable}
                                className="w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 disabled:opacity-50 flex items-center justify-center"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickCartItem;
