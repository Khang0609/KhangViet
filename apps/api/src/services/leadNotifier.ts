import type { ContactLead } from "@khangviet/types";

export interface TelegramEnvBindings {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string | null;
}

/**
 * Định dạng tin nhắn thông báo khách hàng mới theo chuẩn dễ đọc trên điện thoại.
 */
function formatLeadMessage(lead: ContactLead): string {
  const vnTime = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(lead.createdAt || Date.now()));

  return [
    "🔔 KHÁCH HÀNG MỚI ĐĂNG KÝ TƯ VẤN (KHANG VIỆT WEB)",
    `👤 Họ tên: ${lead.fullName}`,
    `📞 Số điện thoại: ${lead.phone}`,
    lead.email ? `📧 Email: ${lead.email}` : null,
    lead.serviceCategory ? `🏢 Hạng mục: ${lead.serviceCategory}` : null,
    lead.projectScale ? `📐 Quy mô: ${lead.projectScale}` : null,
    lead.message ? `📝 Nội dung: ${lead.message}` : null,
    `🕒 Thời gian: ${vnTime}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Gửi thông báo tức thì tới Telegram của Giám đốc khi có khách điền form.
 * Fallback: Nếu TELEGRAM_CHAT_ID đang là null / chưa cấu hình, in thẳng lên Terminal để kiểm thử.
 */
export async function notifyNewLead(
  lead: ContactLead,
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
      console.error("[LEAD-ALERT][TELEGRAM-ERROR]", res.status, errText);
    }
  } catch (err) {
    console.error("[LEAD-ALERT][NETWORK-ERROR]", err);
  }
}
