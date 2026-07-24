import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const RESEND_URL = "https://api.resend.com/emails";

const RECIPIENTS = ["naman@architising.com"];
const CC_RECIPIENTS = ["thecognifyinstitute@gmail.com", "abhaykapoor2306@gmail.com"];

const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(1).max(40),
  email: z.string().email().max(200).optional().or(z.literal("")),
  cls: z.string().min(1).max(10),
  subjects: z.array(z.string().min(1).max(60)).max(20),
  message: z.string().max(4000).optional().or(z.literal("")),
});

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );

export const sendContactEnquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ContactSchema.parse(data))
  .handler(async ({ data }) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      throw new Error("Email service is not configured");
    }

    const classLabel =
      data.cls === "11" ? "Class XI" : data.cls === "12" ? "Class XII" : `Class ${data.cls}`;
    const subject = `New Trial Class Lead — ${data.name} (${classLabel})`;
    const subjectsStr = data.subjects.length ? data.subjects.join(", ") : "Not specified";
    const submitted = new Date().toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="margin:0 0 8px;color:#0f172a;">New Trial Class Enquiry</h2>
        <p style="margin:0 0 20px;color:#475569;">A new enquiry has come in from the Cognify Institute website.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#64748b;width:140px;">Name</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(data.name)}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Phone</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(data.phone)}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(data.email || "—")}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Class</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(classLabel)}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Subjects</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(subjectsStr)}</td></tr>
        </table>
        <h3 style="margin:24px 0 8px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Message</h3>
        <div style="padding:14px 16px;background:#f8fafc;border-radius:10px;white-space:pre-wrap;font-size:14px;">${escapeHtml((data.message || "").trim() || "(no additional message)")}</div>
        <p style="margin-top:24px;font-size:12px;color:#94a3b8;">Submitted: ${escapeHtml(submitted)} · Source: cognifyinstitute.com /contact</p>
      </div>
    `;

    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Cognify Institute <leads@cognifyinstitute.com>",
        to: RECIPIENTS,
        cc: CC_RECIPIENTS,
        reply_to: data.email || undefined,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend send failed", res.status, body);
      throw new Error("Failed to send enquiry");
    }

    return { ok: true };
  });
