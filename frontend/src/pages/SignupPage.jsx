import { useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.fullName.trim()) return toast.error('Full name is required');
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error('Enter a valid email address');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters');
    signup(formData);
  };

  return (
    <main className="min-h-screen bg-white p-2 pt-[80px] sm:p-3 sm:pt-[84px]">
      <section className="mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl overflow-hidden rounded-[32px] bg-[#f5f8f7] lg:grid-cols-[.95fr_1.05fr]">
        <div className="flex items-center justify-center px-5 py-12 sm:px-12"><div className="w-full max-w-md"><span className="text-xs font-semibold uppercase tracking-[.18em] text-[#159a74]">Create customer account</span><h1 className="mt-4 text-5xl font-semibold tracking-[-.055em] text-[#10211b]">Join PharmaCart</h1><p className="mt-3 text-[#66756f]">Your pharmacy. Smarter. Faster.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div><label htmlFor="signup-name" className="mb-2 block text-sm font-medium">Full name</label><div className="relative"><User className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#8ba098]" /><input id="signup-name" value={formData.fullName} onChange={(e) => setFormData((old) => ({ ...old, fullName: e.target.value }))} className="w-full rounded-2xl border border-[#dce7e3] bg-white py-4 pl-12 pr-4 outline-none focus:border-[#159a74] focus:ring-4 focus:ring-[#dff8ef]" placeholder="Your full name" required /></div></div>
            <div><label htmlFor="signup-email" className="mb-2 block text-sm font-medium">Email address</label><div className="relative"><Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#8ba098]" /><input id="signup-email" type="email" value={formData.email} onChange={(e) => setFormData((old) => ({ ...old, email: e.target.value }))} className="w-full rounded-2xl border border-[#dce7e3] bg-white py-4 pl-12 pr-4 outline-none focus:border-[#159a74] focus:ring-4 focus:ring-[#dff8ef]" placeholder="you@example.com" required /></div></div>
            <div><label htmlFor="signup-password" className="mb-2 block text-sm font-medium">Password</label><div className="relative"><Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#8ba098]" /><input id="signup-password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData((old) => ({ ...old, password: e.target.value }))} className="w-full rounded-2xl border border-[#dce7e3] bg-white py-4 pl-12 pr-12 outline-none focus:border-[#159a74] focus:ring-4 focus:ring-[#dff8ef]" placeholder="At least 6 characters" required /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-[#66756f]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button></div></div>
            <button type="submit" disabled={isSigningUp} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#159a74] px-6 font-semibold text-white shadow-lg shadow-[#159a74]/20 hover:bg-[#087558] disabled:opacity-50">{isSigningUp ? 'Creating account…' : <>Create account <ArrowRight className="size-5" /></>}</button>
          </form><p className="mt-6 text-center text-sm text-[#66756f]">Already registered? <Link to="/login" className="font-semibold text-[#087558] hover:underline">Sign in</Link></p></div></div>
        <div className="relative hidden overflow-hidden bg-[#062e28] p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute -bottom-44 -right-32 size-[500px] rounded-full border border-white/10" /><span className="text-xs font-semibold uppercase tracking-[.2em] text-[#65d6b4]">Medicine made easier</span><div className="relative z-10"><h2 className="text-7xl font-semibold leading-[.9] tracking-[-.065em]">Clear information.<br />One secure<br />account.</h2><div className="mt-9 space-y-3 text-white/65">{['Search by brand or generic name','Save your cart and order history','Access clear medicine details'].map((item) => <p key={item} className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-[#65d6b4] text-[#062e28]"><Check className="size-3" /></span>{item}</p>)}</div></div><p className="relative z-10 text-sm text-white/45">Medicine information is for product discovery and does not replace qualified medical advice.</p></div>
      </section>
    </main>
  );
};

export default SignUpPage;
