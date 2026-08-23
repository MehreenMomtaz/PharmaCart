import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import LottieStateIcon from "../components/LottieStateIcon";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";

const money = (price) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(price);

const CartPage = () => {
  const {
    cartItems,
    totalItems,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCartStore();
  const { authUser } = useAuthStore();
  if (!authUser) return <Navigate to="/login" replace />;
  const changeQuantity = (id, quantity) =>
    quantity < 1 ? removeFromCart(id) : updateQuantity(id, quantity);

  if (!cartItems.length)
    return (
      <main className="min-h-screen bg-white p-2 pt-[80px] sm:p-3 sm:pt-[84px]">
        <section className="grid min-h-[calc(100vh-96px)] place-items-center rounded-[32px] bg-[#f5f8f7] px-5">
          <div className="max-w-lg text-center">
            <LottieStateIcon
              className="mx-auto h-36 w-36"
              label="Animated empty shopping cart"
            />
            <span className="mt-4 block text-xs font-semibold uppercase tracking-[.18em] text-[#159a74]">
              Your basket
            </span>
            <h1 className="mt-3 text-5xl font-semibold tracking-[-.055em] text-[#10211b]">
              Your cart is empty
            </h1>
            <p className="mx-auto mt-4 max-w-md leading-7 text-[#66756f]">
              Browse the catalog and add medicines after reviewing their brand,
              generic ingredient and product details.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#159a74] px-6 font-semibold text-white"
            >
              <ArrowLeft className="size-4" />
              Continue shopping
            </Link>
          </div>
        </section>
      </main>
    );

  return (
    <main className="min-h-screen bg-[#f5f8f7] px-3 pb-14 pt-[88px] sm:px-6 sm:pt-[108px]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[.18em] text-[#159a74]">
              Review your basket
            </span>
            <h1 className="mt-3 text-5xl font-semibold tracking-[-.055em] text-[#10211b]">
              Shopping cart
            </h1>
            <p className="mt-3 text-[#66756f]">
              {totalItems} item{totalItems === 1 ? "" : "s"} ready for checkout
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-[#087558]"
          >
            <ArrowLeft className="size-4" />
            Continue shopping
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="space-y-4">
            {cartItems.map((item) => (
              <article
                key={item._id}
                className="rounded-[26px] border border-[#e2ebe7] bg-white p-3 shadow-[0_16px_45px_rgba(7,63,53,.06)]"
              >
                <div className="flex flex-col gap-5 sm:flex-row">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-40 w-full rounded-[20px] bg-[#effbf7] object-cover sm:w-40"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-between p-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#159a74]">
                          {item.category}
                        </span>
                        <h2 className="mt-1 text-2xl font-semibold tracking-[-.035em] text-[#10211b]">
                          {item.name}
                        </h2>
                        <p className="mt-2 text-sm text-[#66756f]">
                          {item.activeIngredient || item.strength} ·{" "}
                          {item.manufacturer}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="grid size-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-600"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                      <div className="flex items-center gap-2 rounded-full bg-[#f5f8f7] p-1">
                        <button
                          onClick={() =>
                            changeQuantity(item._id, item.quantity - 1)
                          }
                          className="grid size-10 place-items-center rounded-full bg-white"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-4" />
                        </button>
                        <strong className="w-8 text-center">
                          {item.quantity}
                        </strong>
                        <button
                          onClick={() =>
                            changeQuantity(item._id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.quantityAvailable}
                          className="grid size-10 place-items-center rounded-full bg-[#dff8ef] text-[#087558] disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#66756f]">
                          Item subtotal
                        </span>
                        <strong className="block text-2xl text-[#073f35]">
                          {money(item.price * item.quantity)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            <button
              onClick={clearCart}
              className="px-3 py-2 text-sm font-semibold text-red-600"
            >
              Clear entire cart
            </button>
          </section>
          <aside className="h-fit rounded-[28px] bg-[#073f35] p-6 text-white shadow-[0_20px_60px_rgba(7,63,53,.18)] lg:sticky lg:top-24">
            <span className="text-xs font-semibold uppercase tracking-[.18em] text-[#65d6b4]">
              Order summary
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em]">
              Ready to checkout
            </h2>
            <div className="my-7 space-y-4 text-sm">
              <div className="flex justify-between text-white/65">
                <span>Subtotal ({totalItems})</span>
                <span className="text-white">{money(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-white/65">
                <span>Delivery</span>
                <span className="text-[#65d6b4]">Free</span>
              </div>
              <div className="flex justify-between text-white/65">
                <span>VAT (15%)</span>
                <span className="text-white">{money(totalPrice * 0.15)}</span>
              </div>
              <div className="flex items-end justify-between border-t border-white/15 pt-5">
                <span>Total</span>
                <strong className="text-3xl">{money(totalPrice * 1.15)}</strong>
              </div>
            </div>
            <Link
              to="/checkout"
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#65d6b4] font-semibold text-[#062e28]"
            >
              <CreditCard className="size-4" />
              Proceed to checkout <ArrowRight className="size-4" />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
