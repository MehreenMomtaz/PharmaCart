import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.email.trim()) return toast.error('Email is required');
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error('Invalid email format');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    login(formData);
  };

  return (
    <main className="min-h-screen bg-white p-2 pt-[80px] sm:p-3 sm:pt-[84px]">
      <section className="mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl overflow-hidden rounded-[32px] bg-[#f5f8f7] lg:grid-cols-[1.05fr_.95fr]">
        <div className="relative hidden overflow-hidden bg-[#062e28] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-32 -top-32 size-[420px] rounded-full border border-white/10" />
          <span className="text-xs font-semibold uppercase tracking-[.2em] text-[#65d6b4]">Customer access</span>
          <div className="relative z-10"><h1 className="text-7xl font-semibold leading-[.9] tracking-[-.065em]">Welcome back<br />to smarter<br />medicine search.</h1><p className="mt-7 max-w-lg text-lg leading-8 text-white/60">Sign in to manage your cart, orders and account while exploring medicines by brand or generic name.</p></div>
          <div className="relative z-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70"><Search className="size-5 text-[#65d6b4]" /> Search Napa, Ace, Paracetamol…</div>
        </div>
        <div className="flex items-center justify-center px-5 py-12 sm:px-12">
          <div className="w-full max-w-md">
            <span className="text-xs font-semibold uppercase tracking-[.18em] text-[#159a74]">PharmaCart account</span>
            <h2 className="mt-4 text-5xl font-semibold tracking-[-.055em] text-[#10211b]">Welcome back</h2>
            <p className="mt-3 text-[#66756f]">Enter your account details to continue.</p>
            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              <div><label htmlFor="login-email" className="mb-2 block text-sm font-medium text-[#10211b]">Email address</label><div className="relative"><Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#8ba098]" /><input id="login-email" type="email" value={formData.email} onChange={(e) => setFormData((old) => ({ ...old, email: e.target.value }))} className="w-full rounded-2xl border border-[#dce7e3] bg-white py-4 pl-12 pr-4 text-[#10211b] outline-none focus:border-[#159a74] focus:ring-4 focus:ring-[#dff8ef]" placeholder="you@example.com" required /></div></div>
              <div><label htmlFor="login-password" className="mb-2 block text-sm font-medium text-[#10211b]">Password</label><div className="relative"><Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#8ba098]" /><input id="login-password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData((old) => ({ ...old, password: e.target.value }))} className="w-full rounded-2xl border border-[#dce7e3] bg-white py-4 pl-12 pr-12 text-[#10211b] outline-none focus:border-[#159a74] focus:ring-4 focus:ring-[#dff8ef]" placeholder="Enter your password" required /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-[#66756f]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button></div></div>
              <button type="submit" disabled={isLoggingIn} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#159a74] px-6 font-semibold text-white shadow-lg shadow-[#159a74]/20 hover:bg-[#087558] disabled:opacity-50">{isLoggingIn ? 'Signing in…' : <>Sign in <ArrowRight className="size-5" /></>}</button>
            </form>
            <p className="mt-7 text-center text-sm text-[#66756f]">New to PharmaCart? <Link to="/signup" className="font-semibold text-[#087558] hover:underline">Create an account</Link></p>
          </div>
        </div>
      </section>
    </main>
  );
};

export { LoginPage };
export default LoginPage;
