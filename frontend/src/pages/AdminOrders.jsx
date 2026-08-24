import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Eye,
  Mail,
  MapPin,
  Package,
  Search,
  User,
  X,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAdminStore } from "../store/useAdminStore";
import { useAuthStore } from "../store/useAuthStore";

const money = (value) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(
    value || 0,
  );
const date = (value) =>
  new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const SelectField = ({ value, onChange, children, label }) => (
  <label className="relative">
    <span className="sr-only">{label}</span>
    <select
      value={value}
      onChange={onChange}
      className="h-14 w-full appearance-none rounded-2xl border border-[#dce7e3] bg-white px-4 pr-11 text-sm text-[#10211b] outline-none transition focus:border-[#159a74] focus:ring-2 focus:ring-[#65d6b4]/30"
      style={{ colorScheme: "light" }}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#159a74]" />
  </label>
);

const AdminOrders = () => {
  const { authUser } = useAuthStore();
  const { orders, isLoadingOrders, fetchOrders } = useAdminStore();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("desc");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders
      .filter(
        (order) =>
          !query ||
          [order.orderNumber, order.userId?.fullName, order.userId?.email].some(
            (value) => value?.toLowerCase().includes(query),
          ),
      )
      .toSorted((a, b) => {
        const first =
          sortBy === "createdAt" ? new Date(a[sortBy]).getTime() : a[sortBy];
        const second =
          sortBy === "createdAt" ? new Date(b[sortBy]).getTime() : b[sortBy];
        return (
          (first > second ? 1 : first < second ? -1 : 0) *
          (direction === "asc" ? 1 : -1)
        );
      });
  }, [direction, orders, search, sortBy]);

  if (!authUser || authUser.role !== "admin")
    return <Navigate to="/" replace />;
  return (
    <main className="min-h-screen bg-[#f5f8f7] px-3 pb-16 pt-[84px] sm:px-6 sm:pt-[104px]">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[30px] bg-[#062e28] px-6 py-10 text-white sm:px-10 sm:py-12">
          <div className="absolute -right-20 -top-32 size-80 rounded-full border border-white/10" />
          <Link
            to="/admin"
            className="relative inline-flex items-center gap-2 text-sm text-[#65d6b4]"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
          <div className="relative mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[.18em] text-[#65d6b4]">
                Fulfilment overview
              </span>
              <h1 className="mt-3 text-5xl font-semibold tracking-[-.055em] sm:text-6xl">
                Manage orders
              </h1>
              <p className="mt-3 max-w-xl text-white/60">
                Review completed customer orders and payment information.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="rounded-full border border-white/15 px-5 py-3 text-sm text-white/70">
                {orders.length} total
              </span>
              <span className="rounded-full bg-[#65d6b4] px-5 py-3 text-sm font-semibold text-[#062e28]">
                {orders.filter((order) => order.status !== "cancelled").length}{" "}
                active
              </span>
            </div>
          </div>
        </section>
        <section className="my-6 grid gap-3 rounded-[26px] border border-[#e2ebe7] bg-white p-3 shadow-[0_16px_45px_rgba(7,63,53,.06)] md:grid-cols-3">
          <label className="relative">
            <span className="sr-only">Search orders</span>
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#159a74]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Order, customer or email…"
              className="h-14 w-full rounded-2xl bg-[#f5f8f7] pl-12 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-[#65d6b4]/50"
            />
          </label>
          <SelectField
            label="Sort field"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="createdAt">Sort by date</option>
            <option value="total">Sort by total</option>
          </SelectField>
          <SelectField
            label="Sort direction"
            value={direction}
            onChange={(event) => setDirection(event.target.value)}
          >
            <option value="desc">Newest / highest first</option>
            <option value="asc">Oldest / lowest first</option>
          </SelectField>
        </section>
        {isLoadingOrders ? (
          <section className="space-y-4">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-52 animate-pulse rounded-[28px] bg-white"
              />
            ))}
          </section>
        ) : filtered.length ? (
          <section className="space-y-4">
            {filtered.map((order) => (
              <article
                key={order._id}
                className="overflow-hidden rounded-[28px] border border-[#e2ebe7] bg-white shadow-[0_18px_55px_rgba(7,63,53,.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_65px_rgba(7,63,53,.1)]"
              >
                <div className="p-5 sm:p-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#dff8ef] text-[#087558]">
                        <Package className="size-6" />
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#159a74]">
                          Order number
                        </span>
                        <h2 className="truncate text-xl font-semibold tracking-[-.03em] text-[#10211b]">
                          #{order.orderNumber}
                        </h2>
                        <p className="mt-2 flex items-center gap-2 text-sm text-[#66756f]">
                          <CalendarDays className="size-4" />
                          {date(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <strong className="text-3xl tracking-[-.04em] text-[#073f35]">
                        {money(order.total)}
                      </strong>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-3 border-y border-[#edf2f0] py-5 md:grid-cols-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="grid size-9 place-items-center rounded-full bg-[#f5f8f7] text-[#159a74]">
                        <User className="size-4" />
                      </span>
                      <div>
                        <span className="block text-[10px] uppercase tracking-[.12em] text-[#8a9993]">
                          Customer
                        </span>
                        <strong>
                          {order.userId?.fullName ||
                            order.deliveryDetails.fullName}
                        </strong>
                      </div>
                    </div>
                    <div className="flex min-w-0 items-center gap-3 text-sm">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f5f8f7] text-[#159a74]">
                        <Mail className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <span className="block text-[10px] uppercase tracking-[.12em] text-[#8a9993]">
                          Email
                        </span>
                        <strong className="block truncate">
                          {order.userId?.email || order.deliveryDetails.email}
                        </strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="grid size-9 place-items-center rounded-full bg-[#f5f8f7] text-[#159a74]">
                        <CreditCard className="size-4" />
                      </span>
                      <div>
                        <span className="block text-[10px] uppercase tracking-[.12em] text-[#8a9993]">
                          Payment
                        </span>
                        <strong>
                          {order.paymentDetails.method.toUpperCase()} ·{" "}
                          {order.paymentDetails.status}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#66756f]">
                        {order.items.length} product line
                        {order.items.length === 1 ? "" : "s"}
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {order.items.slice(0, 4).map((item, index) => (
                          <span
                            key={`${item.name}-${index}`}
                            className="rounded-full bg-[#f5f8f7] px-3 py-1.5 text-xs text-[#52635c]"
                          >
                            {item.name} × {item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#073f35] px-5 text-sm font-semibold text-white"
                      >
                        <Eye className="size-4" />
                        View details
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="grid min-h-[360px] place-items-center rounded-[28px] border border-dashed border-[#b9cbc4] bg-white text-center">
            <div>
              <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#effbf7] text-[#159a74]">
                <Package className="size-9" />
              </span>
              <h2 className="mt-5 text-2xl font-semibold">
                No matching orders
              </h2>
              <p className="mt-2 text-[#66756f]">
                Try changing the search filter.
              </p>
            </div>
          </section>
        )}
        <p className="mt-7 text-center text-sm text-[#66756f]">
          Showing {filtered.length} of {orders.length} orders
        </p>
      </div>
      {selectedOrder ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#031c18]/70 p-3 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-order-title"
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[30px] bg-white p-5 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[.16em] text-[#159a74]">
                  Order details
                </span>
                <h2
                  id="admin-order-title"
                  className="mt-2 text-3xl font-semibold"
                >
                  #{selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="grid size-11 place-items-center rounded-full bg-[#f5f8f7]"
                aria-label="Close order details"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-7 grid gap-6 md:grid-cols-[1.2fr_.8fr]">
              <section>
                <h3 className="font-semibold">Order items</h3>
                <div className="mt-3 space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center gap-3 rounded-2xl bg-[#f5f8f7] p-3"
                    >
                      <img
                        src={item.image}
                        alt=""
                        className="size-12 rounded-xl bg-white object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{item.name}</p>
                        <p className="text-sm text-[#66756f]">
                          {money(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <strong>{money(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                  <div className="flex justify-between text-[#66756f]">
                    <span>Subtotal</span>
                    <span>{money(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#66756f]">
                    <span>Tax</span>
                    <span>{money(selectedOrder.tax)}</span>
                  </div>
                  <div className="flex justify-between text-xl">
                    <span>Total</span>
                    <strong className="text-[#073f35]">
                      {money(selectedOrder.total)}
                    </strong>
                  </div>
                </div>
              </section>
              <section className="space-y-3">
                <div className="rounded-2xl bg-[#effbf7] p-4">
                  <CreditCard className="size-5 text-[#159a74]" />
                  <p className="mt-3 text-xs uppercase tracking-[.12em] text-[#66756f]">
                    Payment
                  </p>
                  <strong className="capitalize">
                    {selectedOrder.paymentDetails.method} ·{" "}
                    {selectedOrder.paymentDetails.status}
                  </strong>
                </div>
                <div className="rounded-2xl bg-[#f5f8f7] p-4">
                  <MapPin className="size-5 text-[#159a74]" />
                  <p className="mt-3 text-xs uppercase tracking-[.12em] text-[#66756f]">
                    Delivery address
                  </p>
                  <strong>{selectedOrder.deliveryDetails.fullName}</strong>
                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#66756f]">
                    {selectedOrder.deliveryDetails.deliveryAddress}
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default AdminOrders;
