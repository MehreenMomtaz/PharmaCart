import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, KeyRound, Loader2, Mail, MessageSquare, Send } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';

const initialForm = { name: '', email: '', subject: '', message: '' };

const ContactSection = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const [form, setForm] = useState(() => ({
    ...initialForm,
    name: authUser?.fullName || authUser?.name || '',
    email: authUser?.email || '',
  }));
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [verification, setVerification] = useState({ required: false, otp: '' });

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: 'sending', message: '' });

    try {
      const response = await axiosInstance.post('/contact', form);
      setVerification({ required: true, otp: '' });
      setStatus({ type: 'code-sent', message: response.data.message });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'We could not send your message. Please try again.',
      });
    }
  };

  const handleVerify = async () => {
    setStatus({ type: 'sending', message: '' });
    try {
      const response = await axiosInstance.post('/contact/verify', { email: form.email, otp: verification.otp });
      setStatus({ type: 'success', message: response.data.message });
      setVerification({ required: false, otp: '' });
      setForm((current) => ({ ...initialForm, name: current.name, email: current.email }));
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Verification failed. Please try again.' });
    }
  };

  const isSending = status.type === 'sending';

  return (
    <section id="contact" className="scroll-mt-24 bg-white px-3 py-4 sm:px-5 sm:py-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[#062e28] px-5 py-12 text-white sm:px-10 sm:py-16 lg:px-16">
        <div className="absolute -right-28 -top-28 size-80 rounded-full border border-white/10" aria-hidden="true" />
        <div className="absolute bottom-0 left-1/3 size-64 rounded-full bg-[#159a74]/15 blur-3xl" aria-hidden="true" />

        <div className="relative grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#65d6b4]">Customer support</span>
            <h2 className="mt-4 max-w-md text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-6xl">How can we help?</h2>
            <p className="mt-6 max-w-md leading-7 text-white/65">Questions about medicines, an order, or your account? Send us a message and our support inbox will receive it securely.</p>
            <div className="mt-9 space-y-4 text-sm">
              <div className="flex items-center gap-3 text-white/80"><span className="grid size-10 place-items-center rounded-full bg-white/10"><Mail className="size-4 text-[#65d6b4]" /></span>Email-based support</div>
              <div className="flex items-center gap-3 text-white/80"><span className="grid size-10 place-items-center rounded-full bg-white/10"><MessageSquare className="size-4 text-[#65d6b4]" /></span>Order and product enquiries</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-[28px] bg-white p-5 text-[#10211b] shadow-2xl shadow-black/20 sm:p-8" aria-label="Customer contact form">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">Full name
                <input required name="name" value={form.name} onChange={updateField} minLength={2} maxLength={80} autoComplete="name" placeholder="Your full name" className="min-h-12 rounded-2xl border border-[#dce7e3] bg-[#f5f8f7] px-4 outline-none focus:border-[#159a74] focus:ring-4 focus:ring-[#65d6b4]/20" />
              </label>
              <label className="grid gap-2 text-sm font-medium">Email address
                <input required type="email" name="email" value={form.email} onChange={updateField} maxLength={160} autoComplete="email" placeholder="you@gmail.com" className="min-h-12 rounded-2xl border border-[#dce7e3] bg-[#f5f8f7] px-4 outline-none focus:border-[#159a74] focus:ring-4 focus:ring-[#65d6b4]/20" />
              </label>
            </div>
            <label className="mt-5 grid gap-2 text-sm font-medium">Subject
              <input required name="subject" value={form.subject} onChange={updateField} minLength={3} maxLength={120} placeholder="How can we help?" className="min-h-12 rounded-2xl border border-[#dce7e3] bg-[#f5f8f7] px-4 outline-none focus:border-[#159a74] focus:ring-4 focus:ring-[#65d6b4]/20" />
            </label>
            <label className="mt-5 grid gap-2 text-sm font-medium">Message
              <textarea required name="message" value={form.message} onChange={updateField} minLength={10} maxLength={3000} rows={6} placeholder="Tell us what you need help with..." className="resize-y rounded-2xl border border-[#dce7e3] bg-[#f5f8f7] px-4 py-3 outline-none focus:border-[#159a74] focus:ring-4 focus:ring-[#65d6b4]/20" />
              <span className="justify-self-end text-xs font-normal text-[#7b8984]">{form.message.length}/3000</span>
            </label>

            {status.type === 'success' ? <p role="status" className="mt-5 flex items-center gap-2 rounded-2xl bg-[#e8faf3] px-4 py-3 text-sm text-[#087558]"><CheckCircle2 className="size-4 shrink-0" />{status.message}</p> : null}
            {status.type === 'code-sent' ? <p role="status" className="mt-5 flex items-center gap-2 rounded-2xl bg-[#e8faf3] px-4 py-3 text-sm text-[#087558]"><Mail className="size-4 shrink-0" />{status.message}</p> : null}
            {status.type === 'error' ? <p role="alert" className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{status.message}</p> : null}

            {verification.required ? <div className="mt-6 rounded-[22px] border border-[#bde9da] bg-[#f2fbf8] p-4">
              <label className="grid gap-2 text-sm font-medium">6-digit verification code
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1"><KeyRound className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#159a74]" /><input required inputMode="numeric" autoComplete="one-time-code" value={verification.otp} onChange={(event) => setVerification((current) => ({ ...current, otp: event.target.value.replace(/\D/g, '').slice(0, 6) }))} placeholder="000000" className="min-h-12 w-full rounded-2xl border border-[#bde9da] bg-white pl-11 pr-4 text-lg tracking-[0.25em] outline-none focus:border-[#159a74]" /></div>
                  <button disabled={isSending || verification.otp.length !== 6} type="button" onClick={handleVerify} className="min-h-12 rounded-full bg-[#159a74] px-6 font-semibold text-white hover:bg-[#087558] disabled:opacity-50">{isSending ? 'Verifying...' : 'Verify & send'}</button>
                </div>
              </label>
              <button disabled={isSending} type="submit" className="mt-3 text-sm font-medium text-[#087558] hover:underline">Resend code</button>
            </div> : <button disabled={isSending} type="submit" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#159a74] px-6 font-semibold text-white shadow-lg shadow-emerald-900/15 hover:bg-[#087558] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
              {isSending ? <><Loader2 className="size-4 animate-spin" />Sending...</> : <>Send message <Send className="size-4" /></>}
            </button>}
            <p className="mt-4 flex items-center gap-1 text-xs text-[#7b8984]">Delivered securely to PharmaCart support <ArrowUpRight className="size-3" /></p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
