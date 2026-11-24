import type { Lead } from "@khangviet/types";

export interface TelegramEnvBindings {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string | null;
}

function formatLeadMessage(lead: Lead): string {
  const timestampMs = lead.createdAt ? lead.createdAt * 1000 : Date.now();
  const vnTime = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(timestampMs));

  return [
    "🔔 KHÁCH HÀNG MỚI ĐĂNG KÝ TƯ VẤN (KHANG VIỆT WEB)",
    `👤 Họ tên: ${lead.name}`,
    `📞 Số điện thoại: ${lead.phone}`,
    lead.email ? `📧 Email: ${lead.email}` : null,
    lead.companyName ? `🏢 Doanh nghiệp: ${lead.companyName}` : null,
    lead.budgetRange ? `💰 Ngân sách: ${lead.budgetRange}` : null,
    lead.message ? `📝 Nội dung: ${lead.message}` : null,
    `🕒 Thời gian: ${vnTime}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function notifyNewLead(
  lead: Lead,
  env?: TelegramEnvBindings
): Promise<void> {
  const message = formatLeadMessage(lead);
  const botToken = env?.TELEGRAM_BOT_TOKEN;
  const chatId = env?.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("\n================ [LEAD-ALERT][TERMINAL-MODE] ================");
    console.log(message);
    console.log("=============================================================\n");
    return;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[TELEGRAM-ERROR]", res.status, errText);
    }
  } catch (error) {
    console.error("[TELEGRAM-EXCEPTION]", error);
  }
}
