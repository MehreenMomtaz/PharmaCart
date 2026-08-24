import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  Search,
  ShoppingBag,
  UserRound,
  Users,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAdminStore } from "../store/useAdminStore";
import { useAuthStore } from "../store/useAuthStore";

const money = (value) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(
    value || 0,
  );
const date = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "No orders yet";

const AdminCustomers = () => {
  const { authUser } = useAuthStore();
  const { customers, isLoadingCustomers, fetchCustomers } = useAdminStore();
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter(
      (customer) =>
        !query ||
        customer.fullName?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query),
    );
  }, [customers, search]);
  const totalRevenue = customers.reduce(
    (sum, customer) => sum + (customer.totalSpent || 0),
    0,
  );

  if (authUser?.role !== "admin") return <Navigate to="/" replace />;
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
                Customer intelligence
              </span>
              <h1 className="mt-3 text-5xl font-semibold tracking-[-.055em]">
                Customers
              </h1>
              <p className="mt-3 text-white/60">
                View registered customers and their order activity.
              </p>
            </div>
            <span className="rounded-full bg-[#65d6b4] px-5 py-3 text-sm font-semibold text-[#062e28]">
              {customers.length} registered
            </span>
          </div>
        </section>
        <section className="my-6 grid gap-3 sm:grid-cols-3">
          <article className="rounded-[22px] border border-[#e2ebe7] bg-white p-5">
            <Users className="size-5 text-[#159a74]" />
            <strong className="mt-5 block text-3xl text-[#073f35]">
              {customers.length}
            </strong>
            <span className="text-sm text-[#66756f]">Total customers</span>
          </article>
          <article className="rounded-[22px] border border-[#e2ebe7] bg-white p-5">
            <ShoppingBag className="size-5 text-[#159a74]" />
            <strong className="mt-5 block text-3xl text-[#073f35]">
              {customers.reduce((sum, item) => sum + item.orderCount, 0)}
            </strong>
            <span className="text-sm text-[#66756f]">Orders placed</span>
          </article>
          <article className="rounded-[22px] border border-[#e2ebe7] bg-white p-5">
            <ShoppingBag className="size-5 text-[#159a74]" />
            <strong className="mt-5 block text-3xl text-[#073f35]">
              {money(totalRevenue)}
            </strong>
            <span className="text-sm text-[#66756f]">Customer value</span>
          </article>
        </section>
        <label className="relative mb-6 block">
          <span className="sr-only">Search customers</span>
          <Search className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#159a74]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email…"
            className="h-14 w-full rounded-[22px] border border-[#e2ebe7] bg-white pl-14 pr-5 outline-none focus:ring-2 focus:ring-[#65d6b4]/50"
          />
        </label>
        {isLoadingCustomers ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-44 animate-pulse rounded-[24px] bg-white"
              />
            ))}
          </div>
        ) : filtered.length ? (
          <section className="grid gap-4 md:grid-cols-2">
            {filtered.map((customer) => (
              <article
                key={customer._id}
                className="rounded-[26px] border border-[#e2ebe7] bg-white p-6 shadow-[0_16px_45px_rgba(7,63,53,.06)]"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#dff8ef] text-[#087558]">
                    <UserRound className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold">
                      {customer.fullName}
                    </h2>
                    <p className="mt-1 flex items-center gap-2 truncate text-sm text-[#66756f]">
                      <Mail className="size-4" />
                      {customer.email}
                    </p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[#edf2f0] pt-5 text-sm">
                  <div>
                    <span className="block text-xs text-[#8a9993]">Orders</span>
                    <strong>{customer.orderCount}</strong>
                  </div>
                  <div>
                    <span className="block text-xs text-[#8a9993]">Spent</span>
                    <strong>{money(customer.totalSpent)}</strong>
                  </div>
                  <div>
                    <span className="block text-xs text-[#8a9993]">
                      Last order
                    </span>
                    <strong className="flex items-center gap-1 text-xs">
                      <CalendarDays className="size-3" />
                      {date(customer.lastOrderAt)}
                    </strong>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="grid min-h-80 place-items-center rounded-[28px] border border-dashed border-[#b9cbc4] bg-white text-center">
            <div>
              <Users className="mx-auto size-10 text-[#9bb2a9]" />
              <h2 className="mt-4 text-2xl font-semibold">
                No customers found
              </h2>
              <p className="mt-2 text-[#66756f]">
                Try a different name or email.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default AdminCustomers;
