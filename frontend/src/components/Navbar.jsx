import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, Mail, Package, Pill, Settings, Shield, ShoppingCart, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import NotificationDropdown from './NotificationDropdown';

export const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { totalItems } = useCartStore();
  const location = useLocation();
  const navigate = useNavigate();
  const goToSection = (sectionId) => {
    const scrollToSection = () => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (location.pathname === '/') scrollToSection();
    else {
      navigate('/');
      window.setTimeout(scrollToSection, 120);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#062e28]/95 text-white shadow-[0_12px_40px_rgba(6,46,40,0.16)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3" aria-label="PharmaCart home">
            <span className="grid size-10 place-items-center rounded-xl bg-[#65d6b4] text-[#062e28] shadow-lg shadow-emerald-950/20"><Pill className="size-5" /></span>
            <span><strong className="block text-base font-semibold leading-none">PharmaCart</strong><small className="hidden text-[10px] uppercase tracking-[0.16em] text-white/55 sm:block">Smart Pharmacy</small></span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-white/70 lg:flex" aria-label="Main navigation">
            <button type="button" onClick={() => goToSection('catalog-results')} className="hover:text-white">Medicines</button>
            <Link to="/blog" className="flex items-center gap-2 hover:text-white"><BookOpen className="size-4" />Health Library</Link>
            <button type="button" onClick={() => goToSection('contact')} className="flex items-center gap-2 hover:text-white"><Mail className="size-4" />Contact</button>
          </nav>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {authUser ? <NotificationDropdown /> : null}
          <Link to="/cart" className="relative grid size-11 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white" aria-label={`Cart with ${totalItems} items`}>
            <ShoppingCart className="size-5" />
            {totalItems > 0 ? <span className="absolute right-0 top-0 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#65d6b4] px-1 text-[10px] font-semibold text-[#062e28]">{totalItems > 99 ? '99+' : totalItems}</span> : null}
          </Link>
          {authUser ? <>
            {authUser.role === 'admin' ? <Link to="/admin" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white md:flex"><Shield className="size-4" />Admin</Link> : null}
            <Link to="/orders" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white md:flex"><Package className="size-4" />Orders</Link>
            <Link to="/settings" className="hidden rounded-full p-3 text-white/75 hover:bg-white/10 hover:text-white sm:block" aria-label="Settings"><Settings className="size-4" /></Link>
            <Link to="/profile" className="grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/15" aria-label="Profile"><User className="size-4" /></Link>
            <button onClick={logout} className="grid size-11 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white" aria-label="Logout"><LogOut className="size-4" /></button>
          </> : <>
            <Link to="/login" className="rounded-full px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white">Login</Link>
            <Link to="/signup" className="hidden rounded-full bg-[#65d6b4] px-5 py-2.5 text-sm font-semibold text-[#062e28] shadow-lg shadow-emerald-950/20 hover:bg-[#7de0c1] sm:block">Create account</Link>
          </>}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
