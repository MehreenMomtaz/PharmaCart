import { createHash, randomInt, timingSafeEqual } from "node:crypto";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const requestLog = new Map();
const pendingMessages = new Map();
const WINDOW_MS = 10 * 60 * 1000;

const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const hashOtp = (email, otp) => createHash("sha256").update(`${email}:${otp}:${process.env.JWT_SECRET || "pharmacart-contact"}`).digest();
const config = () => ({ apiKey: process.env.BREVO_API_KEY?.trim(), senderId: Number(process.env.BREVO_SENDER_ID) || null });

const getContactRecipient = () => {
  const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL?.trim();
  if (!recipientEmail || !EMAIL_PATTERN.test(recipientEmail)) throw new Error("CONTACT_RECIPIENT_EMAIL is not configured");
  return recipientEmail;
};

const sendEmail = async ({ to, subject, htmlContent, replyTo }) => {
  const brevo = config();
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { accept: "application/json", "api-key": brevo.apiKey, "content-type": "application/json" },
    body: JSON.stringify({ sender: { id: brevo.senderId }, to: [{ email: to }], subject, htmlContent, ...(replyTo ? { replyTo } : {}) }),
  });
  if (!response.ok) {
    console.error("Brevo contact email failed:", response.status, await response.text());
    throw new Error("Brevo rejected the email request");
  }
};

const isRateLimited = (key) => {
  const now = Date.now();
  const recent = (requestLog.get(key) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= 3) return true;
  requestLog.set(key, [...recent, now]);
  return false;
};

const validate = (body) => {
  const data = { name: String(body?.name || "").trim(), email: String(body?.email || "").trim().toLowerCase(), subject: String(body?.subject || "").trim(), message: String(body?.message || "").trim() };
  if (data.name.length < 2 || data.name.length > 80) return { error: "Please enter a valid name." };
  if (!EMAIL_PATTERN.test(data.email) || data.email.length > 160) return { error: "Please enter a valid email address." };
  if (data.subject.length < 3 || data.subject.length > 120) return { error: "Subject must be between 3 and 120 characters." };
  if (data.message.length < 10 || data.message.length > 3000) return { error: "Message must be between 10 and 3000 characters." };
  return { data };
};

export const requestContactVerification = async (req, res) => {
  const result = validate(req.body);
  if (result.error) return res.status(400).json({ message: result.error });
  const brevo = config();
  if (!brevo.apiKey || !brevo.senderId) return res.status(503).json({ message: "Contact email service is not configured yet." });
  if (isRateLimited(req.ip || result.data.email)) return res.status(429).json({ message: "Too many requests. Please try again in 10 minutes." });

  const otp = String(randomInt(100000, 1000000));
  pendingMessages.set(result.data.email, { ...result.data, otpHash: hashOtp(result.data.email, otp), expiresAt: Date.now() + WINDOW_MS, attempts: 0 });
  try {
    await sendEmail({
      to: result.data.email,
      subject: "Verify your PharmaCart contact message",
      htmlContent: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#10211b"><h2 style="color:#073f35">Verify your email</h2><p>Hello ${escapeHtml(result.data.name)}, use this code to send your message to PharmaCart support:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#159a74">${otp}</p><p>This code expires in 10 minutes. If you did not request this, ignore this email.</p></div>`,
    });
    return res.status(200).json({ success: true, verificationRequired: true, message: "We sent a 6-digit verification code to your email." });
  } catch (error) {
    pendingMessages.delete(result.data.email);
    console.error("Contact verification failed:", error.message);
    return res.status(502).json({ message: "We could not send the verification email. Please try again later." });
  }
};

export const verifyAndSendContactMessage = async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const otp = String(req.body?.otp || "").trim();
  const pending = pendingMessages.get(email);
  if (!pending || pending.expiresAt < Date.now()) {
    pendingMessages.delete(email);
    return res.status(400).json({ message: "Verification code expired. Please request a new code." });
  }
  if (!/^\d{6}$/.test(otp)) return res.status(400).json({ message: "Enter the 6-digit verification code." });
  if (pending.attempts >= 5) {
    pendingMessages.delete(email);
    return res.status(429).json({ message: "Too many incorrect attempts. Please request a new code." });
  }
  if (!timingSafeEqual(pending.otpHash, hashOtp(email, otp))) {
    pending.attempts += 1;
    return res.status(400).json({ message: "Incorrect verification code." });
  }

  try {
    await sendEmail({
      to: getContactRecipient(),
      replyTo: { name: pending.name, email: pending.email },
      subject: `[Verified customer] PharmaCart contact: ${pending.subject}`,
      htmlContent: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#10211b"><h2 style="color:#073f35">New verified customer message</h2><p style="color:#087558"><strong>✓ Email ownership verified by one-time code</strong></p><p><strong>From:</strong> ${escapeHtml(pending.name)} (${escapeHtml(pending.email)})</p><p><strong>Subject:</strong> ${escapeHtml(pending.subject)}</p><div style="margin-top:20px;padding:20px;background:#f5f8f7;border-radius:14px;white-space:pre-wrap">${escapeHtml(pending.message)}</div><p style="color:#66756f">Reply to respond directly to the verified customer.</p></div>`,
    });
    pendingMessages.delete(email);
    return res.status(200).json({ success: true, message: "Email verified. Your message has been sent to PharmaCart support." });
  } catch (error) {
    console.error("Verified contact delivery failed:", error.message);
    return res.status(502).json({ message: "Your email was verified, but delivery failed. Please try again." });
  }
};
