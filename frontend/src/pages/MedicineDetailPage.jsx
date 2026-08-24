import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useMedicineStore } from "../store/useMedicineStore";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import ReviewsSection from "../components/ReviewsSection";
import toast from "react-hot-toast";
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
} from "lucide-react";

const MedicineDetailPage = () => {
  const { id } = useParams();
  const { authUser } = useAuthStore();
  const {
    currentMedicine,
    fetchMedicineById,
    updateMedicineRating,
    isLoading,
  } = useMedicineStore();
  const { addToCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (id) {
      setImageFailed(false);
      fetchMedicineById(id);
    }
  }, [id, fetchMedicineById]);

  const handleAddToCart = async () => {
    if (!authUser) {
      toast.error("Please login to add items to cart");
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
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
    <main className="min-h-screen bg-[#f5f8f7] px-3 pb-14 pt-[88px] sm:px-6 sm:pt-[108px]">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#087558] transition hover:text-[#159a74]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Medicines
          </Link>
        </div>

        {/* Main Product Section */}
        <div className="mb-8 overflow-hidden rounded-[30px] border border-[#e2ebe7] bg-white p-5 shadow-[0_18px_55px_rgba(7,63,53,.07)] sm:p-8">
          <div className="grid gap-8 md:grid-cols-2 lg:gap-14">
            {/* Product Image */}
            <div className="flex justify-center">
              <div className="grid min-h-80 w-full max-w-md place-items-center overflow-hidden rounded-[26px] bg-[#f5f8f7] p-6">
                {!imageFailed && currentMedicine.image ? (
                  <img
                    src={currentMedicine.image || "/api/placeholder/400/400"}
                    alt={currentMedicine.name}
                    onError={() => setImageFailed(true)}
                    className="max-h-80 w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-[#8a9993]">
                    <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#dff8ef] text-[#159a74]">
                      <Package className="size-9" />
                    </span>
                    <p className="mt-4 text-sm">Product image unavailable</p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[.16em] text-[#159a74]">
                  Medicine details
                </span>
                <h1 className="mb-2 mt-2 text-4xl font-semibold tracking-[-.045em] text-[#10211b]">
                  {currentMedicine.name}
                </h1>

                {/* Price */}
                <div className="mb-4 text-3xl font-semibold text-[#073f35]">
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
                    className="grid size-11 place-items-center rounded-full border border-[#dce7e3] transition hover:bg-[#effbf7] disabled:opacity-40"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="grid min-h-11 min-w-16 place-items-center rounded-full border border-[#dce7e3] text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(
                          currentMedicine.quantityAvailable,
                          quantity + 1,
                        ),
                      )
                    }
                    className="grid size-11 place-items-center rounded-full border border-[#dce7e3] transition hover:bg-[#effbf7] disabled:opacity-40"
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
                  disabled={
                    currentMedicine.quantityAvailable === 0 || isAddingToCart
                  }
                  className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-full bg-[#159a74] px-6 font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-[#087558] disabled:bg-[#b9cbc4]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </button>

                <button
                  aria-label="Save medicine"
                  className="grid size-13 place-items-center rounded-full border border-[#dce7e3] text-[#52635c] transition hover:border-[#65d6b4] hover:bg-[#effbf7] hover:text-[#087558]"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-[#66756f]">
                  <Shield className="w-5 h-5 text-[#159a74]" />
                  <span className="text-sm">Quality Assured</span>
                </div>
                <div className="flex items-center gap-2 text-[#66756f]">
                  <Truck className="w-5 h-5 text-[#159a74]" />
                  <span className="text-sm">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-[#66756f]">
                  <Package className="w-5 h-5 text-[#159a74]" />
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
    </main>
  );
};

export default MedicineDetailPage;
