import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useOrderStore } from '../store/useOrderStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { ArrowLeft, CreditCard, Truck, MapPin, User, Phone, Mail, Home, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
    const { cartItems, totalItems, totalPrice, clearCart, getTotalWithTax } = useCartStore();
    const { authUser } = useAuthStore();
    const { createOrder, initiateSslCommerz } = useOrderStore();
    const { addOrderConfirmation } = useNotificationStore();
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [deliveryDetails, setDeliveryDetails] = useState({
        fullName: authUser?.fullName || '',
        email: authUser?.email || '',
        deliveryAddress: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('sslcommerz');
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
    });

    const [paymentStep, setPaymentStep] = useState('details'); // details, payment, processing, success

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDeliveryDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        setCardDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const required = ['fullName', 'email', 'deliveryAddress'];
        for (let field of required) {
        if (!deliveryDetails[field]) {
                toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
                return false;
            }
        }

        if (paymentMethod === 'bkash' && (!cardDetails.mobileNumber || cardDetails.demoOtp !== '123456')) {
            toast.error('Enter a demo number and use OTP 123456');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsProcessing(true);
        setPaymentStep('payment');
        
        try {
            // Prepare order data
            const orderData = {
                items: cartItems.map(item => ({
                    medicineId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                })),
                deliveryDetails,
                paymentDetails: {
                    method: paymentMethod,
                    status: paymentMethod === 'bkash' ? 'completed' : 'unpaid',
                    demoOtp: paymentMethod === 'bkash' ? cardDetails.demoOtp : undefined
                },
                subtotal: totalPrice,
                tax: totalPrice * 0.15,
                total: getTotalWithTax()
            };

            // Save order to database using order store
            const createdOrder = await createOrder(orderData);
            const orderNumber = createdOrder.orderNumber;

            if (paymentMethod === 'sslcommerz') {
                setPaymentStep('processing');
                const session = await initiateSslCommerz(createdOrder._id);
                window.location.assign(session.gatewayUrl);
                return;
            }
            
            // Add order confirmation notification
            addOrderConfirmation({
                orderNumber,
                total: getTotalWithTax(),
                _id: createdOrder._id
            });
            
            setPaymentStep('success');
            
            // Clear cart and show success
            setTimeout(() => {
                clearCart();
                toast.success(`Order ${orderNumber} placed successfully! Thank you for your purchase.`, {
                    duration: 5000,
                    icon: '🎉'
                });
                
                // Navigate to order history
                navigate('/orders', { 
                    replace: true
                });
            }, 2000);
            
        } catch (error) {
            console.error('Order creation failed:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to process order. Please try again.');
            setPaymentStep('details');
        } finally {
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="text-center py-20">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            No items to checkout
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Your cart is empty. Add some medicines to proceed with checkout.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Checkout
                        </h1>
                        <Link
                            to="/cart"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Cart
                        </Link>
                    </div>
                    <p className="text-gray-600">
                        Complete your order for {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Delivery Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Truck className="w-4 h-4 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Delivery Information</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={deliveryDetails.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={deliveryDetails.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                                        placeholder="Enter your email address"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Home className="w-4 h-4 inline mr-2" />
                                        Delivery Address *
                                    </label>
                                    <textarea
                                        name="deliveryAddress"
                                        value={deliveryDetails.deliveryAddress}
                                        onChange={handleInputChange}
                                        rows={4}
                                        placeholder="Enter your complete delivery address including street, area, city, postal code, and any special instructions..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 resize-none"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Please include your complete address with landmark, area, city, and postal code for accurate delivery.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Payment Information</h2>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('sslcommerz')}
                                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                                            paymentMethod === 'sslcommerz'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <CreditCard className="w-5 h-5 mb-2" />
                                        <div className="font-medium">SSLCOMMERZ Sandbox</div>
                                        <div className="text-sm text-gray-500">Cards, bKash, Nagad & Rocket</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('bkash')}
                                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                                            paymentMethod === 'bkash'
                                                ? 'border-pink-500 bg-pink-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <Phone className="w-5 h-5 mb-2 text-pink-600" />
                                        <div className="font-medium">bKash</div>
                                        <div className="text-sm text-gray-500">Pay securely with bKash</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('cod')}
                                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                                            paymentMethod === 'cod'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <Truck className="w-5 h-5 mb-2" />
                                        <div className="font-medium">Cash on Delivery</div>
                                        <div className="text-sm text-gray-500">Pay when delivered</div>
                                    </button>
                                </div>
                            </div>

                            {paymentMethod === 'sslcommerz' && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                                    You will be redirected to the secure SSLCOMMERZ sandbox checkout. Choose a test card, bKash, Nagad or Rocket there. PharmaCart never receives your card number or PIN.
                                </div>
                            )}

                            {paymentMethod === 'bkash' && (
                                <div className="grid gap-4 rounded-xl border border-pink-200 bg-pink-50 p-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-pink-950">bKash number</label>
                                        <input name="mobileNumber" value={cardDetails.mobileNumber || ''} onChange={handleCardChange} placeholder="01XXXXXXXXX" className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-pink-300" required />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-pink-950">OTP</label>
                                        <input name="demoOtp" value={cardDetails.demoOtp || ''} onChange={handleCardChange} placeholder="123456" inputMode="numeric" className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-pink-300" required />
                                    </div>
                                    <p className="text-xs text-pink-800 md:col-span-2">Use OTP <strong>123456</strong> to confirm the payment.</p>
                                </div>
                            )}

                            {paymentMethod === 'card' && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Card Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={cardDetails.cardNumber}
                                            onChange={handleCardChange}
                                            placeholder="1234 5678 9012 3456"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Expiry Date *
                                        </label>
                                        <input
                                            type="text"
                                            name="expiryDate"
                                            value={cardDetails.expiryDate}
                                            onChange={handleCardChange}
                                            placeholder="MM/YY"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            CVV *
                                        </label>
                                        <input
                                            type="text"
                                            name="cvv"
                                            value={cardDetails.cvv}
                                            onChange={handleCardChange}
                                            placeholder="123"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cardholder Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="cardholderName"
                                            value={cardDetails.cardholderName}
                                            onChange={handleCardChange}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'mobile' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mobile Banking Provider *
                                        </label>
                                        <select
                                            name="mobileProvider"
                                            value={cardDetails.mobileProvider || ''}
                                            onChange={handleCardChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select Provider</option>
                                            <option value="bkash">bKash</option>
                                            <option value="nagad">Nagad</option>
                                            <option value="rocket">Rocket</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mobile Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="mobileNumber"
                                            value={cardDetails.mobileNumber || ''}
                                            onChange={handleCardChange}
                                            placeholder="01XXXXXXXXX"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-medium text-blue-900 mb-2">Payment Instructions:</h4>
                                        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                                            <li>You will receive an SMS with payment instructions</li>
                                            <li>Dial the provided USSD code or use the mobile app</li>
                                            <li>Enter your mobile banking PIN to complete payment</li>
                                            <li>You'll receive a confirmation SMS upon successful payment</li>
                                        </ol>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'cod' && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <h4 className="font-medium text-orange-900 mb-2">Cash on Delivery:</h4>
                                    <p className="text-sm text-orange-800">
                                        Pay {formatPrice(getTotalWithTax())} in cash when your order is delivered. 
                                        Please have the exact amount ready for faster delivery.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                            
                            {/* Cart Items */}
                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="flex gap-3">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Qty: {item.quantity} × {formatPrice(item.price)}
                                            </p>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                                    <span className="font-semibold">{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-semibold text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax (VAT 15%)</span>
                                    <span className="font-semibold">{formatPrice(totalPrice * 0.15)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-bold text-gray-900">Total</span>
                                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                                            {formatPrice(getTotalWithTax())}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        {paymentStep === 'payment' && 'Initiating Payment...'}
                                        {paymentStep === 'processing' && 'Processing Payment...'}
                                        {paymentStep === 'success' && 'Order Confirmed!'}
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Place Order
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                By placing your order, you agree to our Terms of Service and Privacy Policy. 
                                Your payment information is secure and encrypted.
                            </p>
                        </div>
                    </div>
                </form>

                {/* Payment Processing Modal */}
                {isProcessing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                            <div className="text-center">
                                {paymentStep === 'payment' && (
                                    <>
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CreditCard className="w-8 h-8 text-blue-600 animate-pulse" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Initiating Payment</h3>
                                        <p className="text-gray-600">Setting up your payment method...</p>
                                    </>
                                )}
                                
                                {paymentStep === 'processing' && (
                                    <>
                                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
                                        <p className="text-gray-600">
                                            {paymentMethod === 'card' && 'Verifying your card details...'}
                                            {paymentMethod === 'mobile' && `Waiting for payment confirmation from ${cardDetails.mobileProvider}...`}
                                        </p>
                                        {paymentMethod === 'mobile' && (
                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-blue-800">
                                                    Please check your phone and complete the payment using your mobile banking app or USSD code.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                                
                                {paymentStep === 'success' && (
                                    <>
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                                        <p className="text-gray-600">Your order has been confirmed. Redirecting...</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
