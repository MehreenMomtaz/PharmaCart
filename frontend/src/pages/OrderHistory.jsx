import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Clock,
  CreditCard,
  Eye,
  MapPin,
  Package,
  Search,
  X,
} from "lucide-react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import LottieStateIcon from "../components/LottieStateIcon";
import { useAuthStore } from "../store/useAuthStore";
import { useOrderStore } from "../store/useOrderStore";
import { useCartStore } from "../store/useCartStore";

const money = (value) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(
    value,
  );
const date = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
const statusClass = (status) =>
  status === "delivered"
    ? "bg-[#dff8ef] text-[#087558]"
    : status === "cancelled"
      ? "bg-red-50 text-red-700"
      : "bg-[#fff5dc] text-[#94630e]";

const OrderHistory = () => {
  const { authUser } = useAuthStore();
  const clearCart = useCartStore((state) => state.clearCart);
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentNoticeHandled = useRef(false);
  const {
    orders,
    selectedOrder,
    isLoadingOrders,
    fetchUserOrders,
    fetchOrderById,
    clearSelectedOrder,
  } = useOrderStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  useEffect(() => {
    if (authUser) fetchUserOrders();
  }, [authUser, fetchUserOrders]);
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (!payment || paymentNoticeHandled.current) return;
    paymentNoticeHandled.current = true;
    if (payment === "success") {
      clearCart();
      toast.success("Sandbox payment verified. Your order is processing.");
    } else if (payment === "cancelled") toast.error("Payment was cancelled.");
    else toast.error("Payment could not be verified.");
    setSearchParams({}, { replace: true });
  }, [clearCart, searchParams, setSearchParams]);
  if (!authUser) return <Navigate to="/login" replace />;
  const filtered = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) &&
      (status === "all" || order.status === status),
  );

  return (
    <main className="min-h-screen bg-[#f5f8f7] px-3 pb-14 pt-[88px] sm:px-6 sm:pt-[108px]">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 rounded-[30px] bg-[#062e28] px-6 py-10 text-white sm:px-10">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-[#65d6b4]"
          >
            <ArrowLeft className="size-4" />
            Back to medicines
          </Link>
          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[.18em] text-[#65d6b4]">
                Customer account
              </span>
              <h1 className="mt-3 text-5xl font-semibold tracking-[-.055em]">
                Order history
              </h1>
              <p className="mt-3 text-white/60">
                Track automatically processed PharmaCart orders.
              </p>
            </div>
            <span className="rounded-full border border-white/15 px-5 py-3 text-sm text-white/70">
              {orders.length} total orders
            </span>
          </div>
        </section>
        <section className="mb-6 grid gap-3 rounded-[24px] border border-[#e2ebe7] bg-white p-3 md:grid-cols-[1fr_280px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#159a74]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number…"
              className="h-14 w-full rounded-2xl bg-[#f5f8f7] pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#65d6b4]"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-14 rounded-2xl border border-[#dce7e3] bg-white px-4 text-[#10211b]"
            style={{ colorScheme: "light" }}
          >
            <option value="all">All statuses</option>
            {[
              "confirmed",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </section>
        {isLoadingOrders ? (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-[24px] bg-white"
              />
            ))}
          </div>
        ) : filtered.length ? (
          <section className="space-y-4">
            {filtered.map((order) => (
              <article
                key={order._id}
                className="rounded-[26px] border border-[#e2ebe7] bg-white p-5 shadow-[0_16px_45px_rgba(7,63,53,.06)]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#dff8ef] text-[#159a74]">
                      <Package className="size-6" />
                    </span>
                    <div>
                      <span className="text-xs uppercase tracking-[.12em] text-[#66756f]">
                        Order number
                      </span>
                      <h2 className="font-semibold text-[#10211b]">
                        #{order.orderNumber}
                      </h2>
                      <p className="mt-1 flex items-center gap-2 text-sm text-[#66756f]">
                        <Calendar className="size-4" />
                        {date(order.createdAt)} · {order.items.length} items
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusClass(order.status)}`}
                    >
                      {order.status}
                    </span>
                    <strong className="text-2xl text-[#073f35]">
                      {money(order.total)}
                    </strong>
                    <button
                      onClick={() => fetchOrderById(order._id)}
                      className="flex min-h-11 items-center gap-2 rounded-full bg-[#159a74] px-4 text-sm font-semibold text-white"
                    >
                      <Eye className="size-4" />
                      Details
                    </button>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-[#e2ebe7] pt-4">
                  {order.items.slice(0, 4).map((item, index) => (
                    <span
                      key={`${item.name}-${index}`}
                      className="rounded-full bg-[#f5f8f7] px-3 py-1.5 text-xs text-[#66756f]"
                    >
                      {item.name} × {item.quantity}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="grid min-h-[420px] place-items-center rounded-[28px] border border-dashed border-[#b9cbc4] bg-white text-center">
            <div>
              <LottieStateIcon
                className="mx-auto h-32 w-32"
                label="Animated empty orders box"
              />
              <h2 className="mt-6 text-3xl font-semibold tracking-[-.04em]">
                No orders yet
              </h2>
              <p className="mt-3 text-[#66756f]">
                Start shopping to see your automatic order updates here.
              </p>
              <Link
                to="/"
                className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#159a74] px-6 font-semibold text-white"
              >
                Start shopping <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </section>
        )}
      </div>
      {selectedOrder ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#031c18]/70 p-3 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-detail-title"
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[30px] bg-white p-5 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[.16em] text-[#159a74]">
                  Order details
                </span>
                <h2
                  id="order-detail-title"
                  className="mt-2 text-3xl font-semibold"
                >
                  #{selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={clearSelectedOrder}
                className="grid size-11 place-items-center rounded-full bg-[#f5f8f7]"
                aria-label="Close details"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <section>
                <h3 className="font-semibold">Items</h3>
                <div className="mt-3 space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center gap-3 rounded-2xl bg-[#f5f8f7] p-3"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-12 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-[#66756f]">
                          {money(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <strong>{money(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between border-t pt-4 text-xl">
                  <span>Total</span>
                  <strong className="text-[#073f35]">
                    {money(selectedOrder.total)}
                  </strong>
                </div>
              </section>
              <section className="space-y-3">
                <div className="rounded-2xl bg-[#effbf7] p-4">
                  <Clock className="size-5 text-[#159a74]" />
                  <p className="mt-3 text-sm text-[#66756f]">Status</p>
                  <strong className="capitalize">{selectedOrder.status}</strong>
                </div>
                <div className="rounded-2xl bg-[#f5f8f7] p-4">
                  <CreditCard className="size-5 text-[#159a74]" />
                  <p className="mt-3 text-sm text-[#66756f]">Payment</p>
                  <strong>
                    {selectedOrder.paymentDetails.method.toUpperCase()}
                  </strong>
                </div>
                <div className="rounded-2xl bg-[#f5f8f7] p-4">
                  <MapPin className="size-5 text-[#159a74]" />
                  <p className="mt-3 text-sm text-[#66756f]">
                    Delivery address
                  </p>
                  <strong>
                    {selectedOrder.deliveryDetails.deliveryAddress}
                  </strong>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default OrderHistory;
