import { ArrowUpRight, Check, Eye, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

const formatPrice = (price) => new Intl.NumberFormat('en-BD', {
  style: 'currency', currency: 'BDT', maximumFractionDigits: 2,
}).format(price);

const MedicineCard = ({ medicine }) => {
  const { addToCart, getItemQuantity } = useCartStore();
  const { authUser } = useAuthStore();
  const quantityInCart = getItemQuantity(medicine._id);
  const isOutOfStock = medicine.quantityAvailable === 0;
  const genericName = medicine.activeIngredient || 'Generic information unavailable';

  const handleAddToCart = () => {
    if (!authUser) {
      toast.error('Please login to add items to cart');
      return;
    }
    addToCart(medicine);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#e2ebe7] bg-white p-2 shadow-[0_18px_50px_rgba(7,63,53,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_65px_rgba(7,63,53,0.14)]">
      <Link to={`/medicine/${medicine._id}`} className="relative block h-56 overflow-hidden rounded-[22px] bg-[#effbf7]">
        <img src={medicine.image} alt={`${medicine.name} medicine`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[11px] font-semibold ${isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-white/90 text-[#087558] shadow-sm backdrop-blur'}`}>
          {isOutOfStock ? 'Out of stock' : '● In stock'}
        </span>
        {medicine.requiresPrescription ? <span className="absolute right-3 top-3 rounded-full bg-[#fff5dc] px-3 py-1.5 text-[11px] font-semibold text-[#9b6811]">Rx required</span> : null}
      </Link>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#159a74]">{medicine.category}</span>
            <Link to={`/medicine/${medicine._id}`}><h3 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#10211b] transition group-hover:text-[#087558]">{medicine.name}</h3></Link>
          </div>
          <Link to={`/medicine/${medicine._id}`} className="grid size-10 shrink-0 place-items-center rounded-full border border-[#dce7e3] text-[#073f35] hover:bg-[#dff8ef]" aria-label={`View ${medicine.name}`}><ArrowUpRight className="size-4" /></Link>
        </div>

        <div className="mb-4 rounded-2xl bg-[#f5f8f7] p-3">
          <span className="text-[10px] uppercase tracking-[0.12em] text-[#66756f]">Generic ingredient</span>
          <p className="mt-1 font-semibold text-[#073f35]">{genericName}</p>
          <p className="mt-1 text-xs text-[#66756f]">{medicine.strength || 'Strength not listed'}{medicine.dosageForm ? ` · ${medicine.dosageForm}` : ''}</p>
        </div>

        <p className="mb-4 line-clamp-2 text-sm leading-6 text-[#66756f]">{medicine.description}</p>
        <div className="mt-auto">
          <div className="mb-4 flex items-end justify-between gap-3 border-t border-[#e2ebe7] pt-4">
            <div><span className="text-xs text-[#66756f]">Price</span><strong className="block text-2xl font-semibold tracking-[-0.04em] text-[#073f35]">{formatPrice(medicine.price)}</strong></div>
            <div className="text-right text-xs text-[#66756f]"><span>{medicine.manufacturer}</span><br /><span>{medicine.quantityAvailable} units available</span></div>
          </div>
          <div className="flex gap-2">
            {authUser ? <button onClick={handleAddToCart} disabled={isOutOfStock} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#159a74] px-4 text-sm font-semibold text-white hover:bg-[#087558] disabled:cursor-not-allowed disabled:bg-[#dce7e3] disabled:text-[#66756f]">
              {quantityInCart > 0 ? <><Check className="size-4" />Added ({quantityInCart})</> : <><ShoppingCart className="size-4" />Add to cart</>}
            </button> : <Link to="/login" className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#159a74] px-4 text-sm font-semibold text-white hover:bg-[#087558]"><ShoppingCart className="size-4" />Login to add</Link>}
            <Link to={`/medicine/${medicine._id}`} className="grid size-12 place-items-center rounded-full bg-[#effbf7] text-[#073f35] hover:bg-[#dff8ef]" aria-label="View details"><Eye className="size-4" /></Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MedicineCard;
