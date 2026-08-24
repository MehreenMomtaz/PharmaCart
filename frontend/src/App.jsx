import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignupPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderHistory from "./pages/OrderHistory";
import NotificationsPage from "./pages/NotificationsPage";
import MedicineDetailPage from "./pages/MedicineDetailPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMedicines from "./pages/AdminMedicines";
import AdminOrders from "./pages/AdminOrders";
import AdminBlogs from "./pages/AdminBlogs";
import AdminCustomers from "./pages/AdminCustomers";
import AddEditBlog from "./pages/AddEditBlog";
import AddMedicine from "./pages/AddMedicine";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const elements = document.querySelectorAll(
        ".page-transition section, .page-transition article",
      );
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -36px" },
      );
      elements.forEach((element, index) => {
        element.classList.add("scroll-reveal");
        element.style.setProperty(
          "--reveal-delay",
          `${Math.min(index % 4, 3) * 45}ms`,
        );
        observer.observe(element);
      });
      window.__pharmaRevealObserver = observer;
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.__pharmaRevealObserver?.disconnect();
      delete window.__pharmaRevealObserver;
    };
  }, [location.pathname]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader className="animate-spin h-6 w-6 text-blue-500" />
      </div>
    );
  }

  const userOnly = (page) =>
    authUser ? page : <Navigate to="/login" replace />;
  const adminOnly = (page) =>
    authUser?.role === "admin" ? (
      page
    ) : (
      <Navigate to={authUser ? "/" : "/login"} replace />
    );

  return (
    <div className="app-shell">
      <Navbar />
      <main key={location.pathname} className="page-transition">
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/medicine/:id" element={<MedicineDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={userOnly(<CheckoutPage />)} />
          <Route path="/orders" element={userOnly(<OrderHistory />)} />
          <Route
            path="/notifications"
            element={userOnly(<NotificationsPage />)}
          />
          <Route path="/settings" element={userOnly(<SettingsPage />)} />
          <Route path="/profile" element={userOnly(<ProfilePage />)} />

          <Route path="/admin" element={adminOnly(<AdminDashboard />)} />
          <Route
            path="/admin/medicines"
            element={adminOnly(<AdminMedicines />)}
          />
          <Route
            path="/admin/medicines/new"
            element={adminOnly(<AddMedicine />)}
          />
          <Route
            path="/admin/medicines/:id"
            element={adminOnly(<MedicineDetailPage />)}
          />
          <Route
            path="/admin/medicines/:id/edit"
            element={adminOnly(<AddMedicine />)}
          />
          <Route path="/admin/orders" element={adminOnly(<AdminOrders />)} />
          <Route
            path="/admin/customers"
            element={adminOnly(<AdminCustomers />)}
          />
          <Route path="/admin/blogs" element={adminOnly(<AdminBlogs />)} />
          <Route path="/admin/blogs/new" element={adminOnly(<AddEditBlog />)} />
          <Route
            path="/admin/blogs/:id/edit"
            element={adminOnly(<AddEditBlog />)}
          />

          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
};

export default App;
