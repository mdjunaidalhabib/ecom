import { getOrderMailSendSettings } from "./orderMailSendSettings.js";
import { sendAdminOrderEmail } from "./sendAdminOrderEmail.js";

export async function sendOrderNotificationEmail(orderData) {
  const settings = await getOrderMailSendSettings();

  if (!settings.enabled) {
    console.log("❌ Mail system disabled");
    return;
  }

  const activeEmail = settings.emails.find((e) => e.active);

  if (!activeEmail) {
    console.log("⚠️ No active admin email");
    return;
  }

  await sendAdminOrderEmail({
    to: activeEmail.email,
    ...orderData,
  });
}
