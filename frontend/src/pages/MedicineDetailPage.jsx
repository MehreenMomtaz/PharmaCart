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
  AlertTriangle,
  Clock,
  Pill,
  Activity,
  ShieldAlert,
  Info,
  Building2,
  FileText,
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
            {/* Product Image & Quick Badges */}
            <div className="flex flex-col items-center">
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

              {/* Badges under image */}
              <div className="mt-4 flex flex-wrap justify-center gap-2 w-full max-w-md">
                <span className="rounded-full bg-[#dff8ef] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#087558]">
                  {currentMedicine.category}
                </span>
                {currentMedicine.requiresPrescription ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
                    <AlertTriangle className="size-3.5 text-amber-600" />
                    Prescription Required (Rx)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle className="size-3.5 text-emerald-600" />
                    Over-the-Counter (OTC)
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[.16em] text-[#159a74]">
                    Medicine details
                  </span>
                  {currentMedicine.manufacturer && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#66756f]">
                      <Building2 className="size-3.5 text-[#159a74]" />
                      {currentMedicine.manufacturer}
                    </span>
                  )}
                </div>

                <h1 className="mb-2 mt-2 text-4xl font-semibold tracking-[-.045em] text-[#10211b]">
                  {currentMedicine.name}
                </h1>

                {/* Active Ingredient / Generic Name Highlight */}
                {currentMedicine.activeIngredient && (
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-xl bg-[#effbf7] px-3 py-1.5 text-sm font-medium text-[#073f35]">
                    <Pill className="size-4 text-[#159a74]" />
                    <span>Generic: <strong className="font-semibold">{currentMedicine.activeIngredient}</strong></span>
                    {currentMedicine.strength && (
                      <span className="text-[#66756f]">· {currentMedicine.strength}</span>
                    )}
                  </div>
                )}

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
                        )
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

        {/* Detailed Medical Information Section */}
        <section className="mb-8 overflow-hidden rounded-[30px] border border-[#e2ebe7] bg-white p-5 shadow-[0_18px_55px_rgba(7,63,53,.07)] sm:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#e2ebe7] pb-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[.16em] text-[#159a74]">
                Clinical & Health Guide
              </span>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#10211b]">
                Medical Information & Precautions
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#effbf7] px-3.5 py-1.5 text-xs font-semibold text-[#087558] border border-[#dce7e3]">
              <FileText className="size-4" />
              Verified Health Data
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Dosage & Usage */}
            <div className="flex flex-col rounded-2xl border border-[#dce7e3] bg-[#f8faf9] p-5 transition hover:border-[#159a74]/50 hover:shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-[#dff8ef] text-[#087558]">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#10211b]">Dosage & Usage</h3>
                  <span className="text-xs text-[#66756f]">Administration guide</span>
                </div>
              </div>
              <div className="mt-1 flex-1">
                {currentMedicine.dosage ? (
                  <p className="text-sm leading-relaxed text-[#3b4b45] whitespace-pre-line font-medium">
                    {currentMedicine.dosage}
                  </p>
                ) : (
                  <p className="text-sm italic text-[#8a9993]">
                    No specific dosage specified. Please follow the instructions provided by your physician or pharmacist.
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-[#e2ebe7] text-[11px] text-[#66756f]">
                Always follow prescribed timings and quantities.
              </div>
            </div>

            {/* Side Effects */}
            <div className="flex flex-col rounded-2xl border border-[#f3dada] bg-[#fffaf9] p-5 transition hover:border-[#e59b9b] hover:shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-[#ffeaea] text-[#c93b3b]">
                  <Activity className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#10211b]">Side Effects</h3>
                  <span className="text-xs text-[#66756f]">Potential reactions</span>
                </div>
              </div>
              <div className="mt-1 flex-1">
                {currentMedicine.sideEffects ? (
                  <p className="text-sm leading-relaxed text-[#4d3636] whitespace-pre-line font-medium">
                    {currentMedicine.sideEffects}
                  </p>
                ) : (
                  <p className="text-sm italic text-[#8a9993]">
                    No major side effects listed for normal recommended dosage. If you notice unusual symptoms, consult a doctor.
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-[#f3dada] text-[11px] text-[#825555]">
                Discontinue use if severe allergic reactions occur.
              </div>
            </div>

            {/* Warnings & Precautions */}
            <div className="flex flex-col rounded-2xl border border-[#fae6b8] bg-[#fffbf2] p-5 transition hover:border-[#e2b755] hover:shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-[#fff2d2] text-[#9b6811]">
                  <ShieldAlert className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#10211b]">Warnings</h3>
                  <span className="text-xs text-[#66756f]">Safety & precautions</span>
                </div>
              </div>
              <div className="mt-1 flex-1">
                {currentMedicine.warnings ? (
                  <p className="text-sm leading-relaxed text-[#544120] whitespace-pre-line font-medium">
                    {currentMedicine.warnings}
                  </p>
                ) : (
                  <p className="text-sm italic text-[#8a9993]">
                    Keep out of reach of children. Store in a cool, dry place away from heat and direct sunlight.
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-[#fae6b8] text-[11px] text-[#805e24]">
                Consult a doctor if pregnant, nursing, or on other medications.
              </div>
            </div>
          </div>

          {/* Quick Specifications Table */}
          <div className="mt-6 rounded-2xl bg-[#f5f8f7] p-5 border border-[#e2ebe7]">
            <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#159a74] mb-3">
              Quick Specifications
            </h4>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 text-sm">
              <div>
                <span className="text-xs text-[#66756f] block">Generic Name</span>
                <span className="font-semibold text-[#10211b]">
                  {currentMedicine.activeIngredient || "Not specified"}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#66756f] block">Category</span>
                <span className="font-semibold text-[#10211b]">
                  {currentMedicine.category || "General"}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#66756f] block">Manufacturer</span>
                <span className="font-semibold text-[#10211b]">
                  {currentMedicine.manufacturer || "Not specified"}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#66756f] block">Prescription</span>
                <span className="font-semibold text-[#10211b]">
                  {currentMedicine.requiresPrescription ? "Required (Rx)" : "Not Required (OTC)"}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#66756f] block">Dosage Form</span>
                <span className="font-semibold text-[#10211b]">
                  {currentMedicine.dosageForm || "Standard"}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#66756f] block">Availability</span>
                <span className="font-semibold text-[#087558]">
                  {currentMedicine.quantityAvailable > 0
                    ? `${currentMedicine.quantityAvailable} in stock`
                    : "Out of stock"}
                </span>
              </div>
            </div>
          </div>

          {/* Medical Disclaimer Note */}
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#effbf7] p-4 text-[#073f35] border border-[#dce7e3]">
            <Info className="size-5 shrink-0 text-[#159a74] mt-0.5" />
            <p className="text-xs leading-5 text-[#3b4b45]">
              <strong>Medical Disclaimer:</strong> The clinical information, dosage suggestions, side effects, and precautions displayed here are for informational and educational purposes only. Always consult your licensed physician, healthcare specialist, or pharmacist before starting, changing, or stopping any medication.
            </p>
          </div>
        </section>

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

