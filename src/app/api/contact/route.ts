import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getTenant } from "@/lib/tenant";
import { emailShell, escapeHtml } from "@/lib/booking/email/shared";

export const runtime = "nodejs";

/**
 * Website "Send Us a Question" contact form handler.
 *
 * Delivers inquiries via Resend (the same provider that already sends booking
 * confirmations) straight to the operator's support inbox, with the sender's
 * address as reply-to. This replaces the previous third-party form services
 * (Web3Forms / FormSubmit) — FormSubmit's native-POST fallback was navigating
 * users to formsubmit.co and showing a raw 502 when that service was down.
 */

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success so they don't retry, but
  // send nothing.
  if (typeof body._honey === "string" && body._honey.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  if (!message) return NextResponse.json({ error: "Please enter a message." }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[api/contact] RESEND_API_KEY is not set");
    return NextResponse.json(
      { error: "Messaging is temporarily unavailable. Please call or email us directly." },
      { status: 500 }
    );
  }

  const tenant = getTenant();
  const resend = new Resend(apiKey);

  const detailRows = [
    ["Name", name],
    ["Email", email],
    ["Phone", phone || "Not provided"],
  ]
    .map(
      ([label, value], i) =>
        `<tr><td style="padding:10px 14px;color:#7a7268;font-size:13px;${i ? "border-top:1px solid #e4ddd2;" : ""}">${escapeHtml(label)}</td>` +
        `<td style="padding:10px 14px;font-weight:600;${i ? "border-top:1px solid #e4ddd2;" : ""}">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const inner = `
    <p style="font-size:16px;">New website inquiry via the contact form:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#fff;border:1px solid #e4ddd2;border-radius:12px;overflow:hidden;">${detailRows}</table>
    <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#7a7268;margin:20px 0 6px;">Message</p>
    <p style="font-size:15px;line-height:1.6;white-space:pre-wrap;margin:0;">${escapeHtml(message)}</p>
  `;

  const result = await resend.emails.send({
    from: tenant.fromEmail,
    to: tenant.supportEmail,
    replyTo: email,
    subject: `${tenant.formSubjectPrefix}Website inquiry from ${name}`,
    html: emailShell({ tenant, body: inner }),
    text: `New website inquiry\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\n\nMessage:\n${message}`,
  });

  if (result.error) {
    console.error("[api/contact] Resend rejected:", JSON.stringify(result.error));
    return NextResponse.json(
      { error: "We couldn't send your message. Please email or call us directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
