import OrderMailSend from "../../src/models/order-mail-send.js";

export async function getOrderMailSendSettings() {
  let settings = await OrderMailSend.findOne();

  if (!settings) {
    settings = await OrderMailSend.create({
      enabled: true,
      emails: [],
    });
  }

  if (!Array.isArray(settings.emails)) {
    settings.emails = [];
    await settings.save();
  }

  return settings;
}
