import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Banknote,
  BookOpen,
  Package,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Star,
  Users,
  WalletCards,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAdminStore } from "../store/useAdminStore";
import { useAuthStore } from "../store/useAuthStore";

const money = (value) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value || 0);
const number = (value) => new Intl.NumberFormat("en-BD").format(value || 0);
const statusColor = {
  delivered: "#159a74",
  processing: "#65d6b4",
  confirmed: "#276c5d",
  shipped: "#8bbdaf",
  with_delivery_partner: "#8bbdaf",
  out_for_delivery: "#e2ad41",
  return_requested: "#d97706",
  returned: "#b45309",
  refund_requested: "#e85d75",
  refunded: "#8b5cf6",
  cancelled: "#ef6a6a",
};
const ranges = [
  ["7d", "7 days"],
  ["30d", "30 days"],
  ["12m", "12 months"],
  ["all", "All time"],
];

const TrendChart = ({ data }) => {
  const points = useMemo(() => {
    if (!data.length) return [];
    const max = Math.max(
      ...data.flatMap((item) => [item.revenue, item.profit]),
      1,
    );
    return data.map((item, index) => ({
      ...item,
      x: data.length === 1 ? 50 : 5 + (index / (data.length - 1)) * 90,
      revenueY: 92 - (item.revenue / max) * 78,
      profitY: 92 - (item.profit / max) * 78,
    }));
  }, [data]);
  const totals = useMemo(
    () =>
      data.reduce(
        (result, item) => ({
          revenue: result.revenue + item.revenue,
          profit: result.profit + item.profit,
        }),
        { revenue: 0, profit: 0 },
      ),
    [data],
  );
  const path = (key) =>
    points
      .map((point, index) => `${index ? "L" : "M"} ${point.x} ${point[key]}`)
      .join(" ");
  const cost = Math.max(totals.revenue - totals.profit, 0);
  const profitShare = totals.revenue
    ? Math.min((totals.profit / totals.revenue) * 100, 100)
    : 0;
  const split = totals.revenue
    ? `conic-gradient(#e2ad41 0 ${profitShare}%, #159a74 ${profitShare}% 100%)`
    : "#e7efec";
  if (!points.length)
    return (
      <div className="grid h-64 place-items-center rounded-2xl bg-[#f5f8f7] text-sm text-[#66756f]">
        No sales in this period
      </div>
    );
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_210px]">
      <div className="overflow-hidden rounded-2xl bg-[#f8fbfa] p-3">
        <svg
          viewBox="0 0 100 100"
          className="h-64 w-full"
          role="img"
          aria-label="Revenue and gross profit trend chart"
        >
          <defs>
            <linearGradient id="sales-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#159a74" stopOpacity=".28" />
              <stop offset="1" stopColor="#159a74" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[20, 40, 60, 80].map((y) => (
            <line
              key={y}
              x1="5"
              x2="95"
              y1={y}
              y2={y}
              stroke="#dce7e3"
              strokeWidth=".4"
            />
          ))}
          {points.length > 1 ? (
            <>
              <path
                d={`${path("revenueY")} L ${points.at(-1).x} 94 L ${points[0].x} 94 Z`}
                fill="url(#sales-area)"
              />
              <path
                d={path("revenueY")}
                fill="none"
                stroke="#159a74"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={path("profitY")}
                fill="none"
                stroke="#e2ad41"
                strokeWidth="1.6"
                strokeDasharray="3 2"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              <rect
                x="38"
                y={points[0].revenueY}
                width="10"
                height={92 - points[0].revenueY}
                rx="3"
                fill="#159a74"
              />
              <rect
                x="52"
                y={points[0].profitY}
                width="10"
                height={92 - points[0].profitY}
                rx="3"
                fill="#e2ad41"
              />
            </>
          )}
          {points.map((point) => (
            <circle
              key={point._id}
              cx={point.x}
              cy={point.revenueY}
              r="1.6"
              fill="#fff"
              stroke="#159a74"
              strokeWidth="1"
            />
          ))}
        </svg>
        <div className="flex justify-between gap-3 text-[10px] text-[#7a8b84]">
          {points
            .filter(
              (_, index) =>
                index === 0 ||
                index === points.length - 1 ||
                index === Math.floor(points.length / 2),
            )
            .map((point) => (
              <span key={point._id}>{point._id}</span>
            ))}
        </div>
      </div>
      <aside
        className="flex flex-col justify-center rounded-2xl border border-[#e2ebe7] bg-white p-4"
        aria-label="Revenue split pie chart"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#159a74]">
          Revenue split
        </span>
        <div
          className="relative mx-auto my-5 grid size-32 place-items-center rounded-full"
          style={{ background: split }}
        >
          <div className="grid size-20 place-items-center rounded-full bg-white text-center">
            <div>
              <strong className="block text-xl text-[#073f35]">
                {Math.round(profitShare)}%
              </strong>
              <span className="text-[9px] text-[#66756f]">margin</span>
            </div>
          </div>
        </div>
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#e2ad41]" />
            <span className="flex-1 text-[#66756f]">Gross profit</span>
            <strong>{money(totals.profit)}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#159a74]" />
            <span className="flex-1 text-[#66756f]">Estimated cost</span>
            <strong>{money(cost)}</strong>
          </div>
        </div>
      </aside>
    </div>
  );
};

const StatusChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  let offset = 0;
  const gradient = data.length
    ? `conic-gradient(${data
        .map((item) => {
          const start = offset;
          offset += (item.count / total) * 100;
          return `${statusColor[item._id] || "#9eb4ac"} ${start}% ${offset}%`;
        })
        .join(",")})`
    : "#edf3f1";
  return (
    <div className="grid gap-7 sm:grid-cols-[170px_1fr] sm:items-center">
      <div
        className="relative mx-auto grid size-40 place-items-center rounded-full"
        style={{ background: gradient }}
      >
        <div className="grid size-24 place-items-center rounded-full bg-white text-center">
          <div>
            <strong className="block text-3xl text-[#073f35]">{total}</strong>
            <span className="text-xs text-[#66756f]">orders</span>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item._id} className="flex items-center gap-3">
            <span
              className="size-2.5 rounded-full"
              style={{ background: statusColor[item._id] || "#9eb4ac" }}
            />
            <span className="flex-1 text-sm capitalize text-[#66756f]">
              {item._id}
            </span>
            <strong className="text-sm">{item.count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { authUser } = useAuthStore();
  const { dashboardStats, isLoadingStats, fetchDashboardStats } =
    useAdminStore();
  const [range, setRange] = useState("30d");
  useEffect(() => {
    fetchDashboardStats(range);
  }, [fetchDashboardStats, range]);
  if (!authUser || authUser.role !== "admin")
    return <Navigate to="/" replace />;
  const stats = dashboardStats?.stats;
  const analytics = dashboardStats?.analytics;
  const cards = [
    [
      "Units sold",
      number(analytics?.unitsSold),
      <ShoppingBag key="sales" className="size-5" />,
    ],
    [
      "Revenue",
      money(analytics?.revenue),
      <Banknote key="revenue" className="size-5" />,
    ],
    [
      "Gross profit",
      money(analytics?.profit),
      <TrendingUp key="profit" className="size-5" />,
      "Estimated where cost is unavailable",
    ],
    [
      "Orders",
      number(analytics?.orders),
      <WalletCards key="orders" className="size-5" />,
    ],
  ];
  return (
    <main className="min-h-screen bg-[#f5f8f7] px-3 pb-12 pt-[84px] sm:px-6 sm:pt-[104px]">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[30px] bg-[#062e28] px-6 py-10 text-white sm:px-10 sm:py-14">
          <div className="absolute -right-24 -top-40 size-96 rounded-full border border-white/10" />
          <span className="text-xs font-semibold uppercase tracking-[.2em] text-[#65d6b4]">
            Business intelligence
          </span>
          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-5xl font-semibold tracking-[-.06em] sm:text-6xl">
                Performance overview
              </h1>
              <p className="mt-4 text-white/60">
                Welcome back, {authUser.fullName}. Monitor sales, revenue and
                order health.
              </p>
            </div>
            <Link
              to="/admin/medicines/new"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#65d6b4] px-6 font-semibold text-[#062e28]"
            >
              Add medicine <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </section>
        <div className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-.04em] text-[#10211b]">
              Analytics report
            </h2>
            <p className="mt-1 text-sm text-[#66756f]">
              Cancelled orders are excluded from revenue and profit.
            </p>
          </div>
          <div className="flex w-fit flex-wrap rounded-[22px] border border-[#dce7e3] bg-white p-1">
            {ranges.map(([value, label]) => (
              <button
                key={value}
                onClick={() => setRange(value)}
                className={`min-h-10 rounded-full px-4 text-xs font-semibold transition ${range === value ? "bg-[#073f35] text-white" : "text-[#66756f] hover:bg-[#effbf7]"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {isLoadingStats ? (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-[24px] bg-white"
              />
            ))}
          </section>
        ) : dashboardStats ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map(([label, value, icon, note]) => (
                <article
                  key={label}
                  className="rounded-[24px] border border-[#e2ebe7] bg-white p-5 shadow-[0_16px_45px_rgba(7,63,53,.06)]"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-[#66756f]">{label}</span>
                    <span className="grid size-11 place-items-center rounded-full bg-[#effbf7] text-[#159a74]">
                      {icon}
                    </span>
                  </div>
                  <strong className="mt-7 block text-3xl font-semibold tracking-[-.05em] text-[#073f35]">
                    {value}
                  </strong>
                  {note ? (
                    <span className="mt-2 block text-[10px] text-[#8a9993]">
                      {note}
                    </span>
                  ) : null}
                </article>
              ))}
            </section>
            <section className="my-6 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
              <article className="rounded-[28px] border border-[#e2ebe7] bg-white p-5 shadow-[0_18px_50px_rgba(7,63,53,.07)] sm:p-7">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[.16em] text-[#159a74]">
                      Sales trend
                    </span>
                    <h2 className="mt-2 text-2xl font-semibold">
                      Revenue & gross profit
                    </h2>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-2">
                      <i className="size-2 rounded-full bg-[#159a74]" />
                      Revenue
                    </span>
                    <span className="flex items-center gap-2">
                      <i className="size-2 rounded-full bg-[#e2ad41]" />
                      Profit
                    </span>
                  </div>
                </div>
                <TrendChart data={dashboardStats.salesTrend} />
              </article>
              <article className="rounded-[28px] border border-[#e2ebe7] bg-white p-5 shadow-[0_18px_50px_rgba(7,63,53,.07)] sm:p-7">
                <span className="text-xs font-semibold uppercase tracking-[.16em] text-[#159a74]">
                  Order statistics
                </span>
                <h2 className="mb-7 mt-2 text-2xl font-semibold">
                  Status breakdown
                </h2>
                <StatusChart data={dashboardStats.statusStats} />
              </article>
            </section>
            <nav
              className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
              aria-label="Admin actions"
            >
              {[
                [
                  "Manage medicines",
                  "/admin/medicines",
                  <Package key="medicines" className="size-4 text-[#159a74]" />,
                ],
                [
                  "Manage orders",
                  "/admin/orders",
                  <ShoppingCart
                    key="manage-orders"
                    className="size-4 text-[#159a74]"
                  />,
                ],
                [
                  "Customers",
                  "/admin/customers",
                  <Users key="customers" className="size-4 text-[#159a74]" />,
                ],
                [
                  "Health tips & blogs",
                  "/admin/blogs",
                  <BookOpen key="blogs" className="size-4 text-[#159a74]" />,
                ],
              ].map(([label, to, icon]) => (
                <Link
                  key={label}
                  to={to}
                  className="flex min-h-14 items-center justify-between rounded-full border border-[#dce7e3] bg-white px-5 font-semibold text-[#073f35] hover:border-[#65d6b4] hover:bg-[#effbf7]"
                >
                  <span className="flex items-center gap-3">
                    {icon}
                    {label}
                  </span>
                  <ArrowUpRight className="size-4" />
                </Link>
              ))}
            </nav>
            <section className="mb-6 grid gap-3 sm:grid-cols-2">
              {[
                [
                  "Published & draft articles",
                  stats?.totalBlogs,
                  <BookOpen key="blog-count" className="size-5" />,
                ],
                [
                  "Customer reviews",
                  stats?.totalReviews,
                  <Star key="review-count" className="size-5" />,
                ],
              ].map(([label, value, icon]) => (
                <article
                  key={label}
                  className="flex items-center gap-4 rounded-[22px] border border-[#e2ebe7] bg-white p-5"
                >
                  <span className="grid size-11 place-items-center rounded-full bg-[#effbf7] text-[#159a74]">
                    {icon}
                  </span>
                  <div>
                    <strong className="block text-2xl text-[#073f35]">
                      {number(value)}
                    </strong>
                    <span className="text-xs text-[#66756f]">{label}</span>
                  </div>
                </article>
              ))}
            </section>
            <section className="rounded-[28px] border border-[#e2ebe7] bg-white p-5 shadow-[0_18px_50px_rgba(7,63,53,.07)] sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[.16em] text-[#159a74]">
                    Live overview
                  </span>
                  <h2 className="mt-2 text-2xl font-semibold">Recent orders</h2>
                </div>
                <Link
                  to="/admin/orders"
                  className="text-sm font-semibold text-[#087558]"
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {dashboardStats.recentOrders.length ? (
                  dashboardStats.recentOrders.map((order) => (
                    <article
                      key={order._id}
                      className="flex flex-col gap-4 rounded-2xl bg-[#f5f8f7] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-sm text-[#66756f]">
                          {order.userId?.fullName || "Customer"} ·{" "}
                          {money(order.total)}
                        </p>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="py-12 text-center text-[#66756f]">
                    No recent orders
                  </p>
                )}
              </div>
            </section>
            <div className="mt-5 flex flex-wrap gap-3 text-xs text-[#66756f]">
              <span>{number(stats?.totalMedicines)} medicines</span>
              <span>•</span>
              <span>{number(stats?.totalUsers)} customers</span>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
};

export default AdminDashboard;
