import type { LeadPayload } from "@/features/lead-form/schema";

/**
 * Lead delivery service — CMS/CRM-ready seam.
 *
 * Right now it just logs the lead server-side. Swap the body of
 * `deliverLead` to forward to Telegram Bot API, a CRM, email, or a
 * database — the rest of the app is decoupled from the transport.
 */
export async function deliverLead(lead: LeadPayload): Promise<void> {
  // Example integrations (enable by setting env vars):
  //
  // const token = process.env.TELEGRAM_BOT_TOKEN;
  // const chatId = process.env.TELEGRAM_CHAT_ID;
  // if (token && chatId) {
  //   await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ chat_id: chatId, text: formatLead(lead) }),
  //   });
  // }

  console.info("[floby] new lead:", {
    name: lead.name,
    phone: lead.phone,
    service: lead.service,
    source: lead.source,
    total: lead.total,
    at: new Date().toISOString(),
  });
}
