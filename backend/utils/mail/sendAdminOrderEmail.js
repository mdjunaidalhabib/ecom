import nodemailer from "nodemailer";

export async function sendAdminOrderEmail({
  to,
  orderId,
  customerName,
  customerPhone,
  address,
  note,
  items,
  subtotal,
  deliveryCharge,
  discount,
  total,
  paymentMethod,
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const safe = (v) => (v == null ? "" : String(v));

  const itemsHtml = (Array.isArray(items) ? items : [])
    .map((it, idx) => {
      const name = safe(it?.name || it?.title || it?.productName || "Item");
      const qty = Number(it?.qty || 0);
      const price = Number(it?.price || 0);
      const color = it?.color ? ` (${safe(it.color)})` : "";
      return `<tr>
        <td style="padding:8px;border:1px solid #eee;">${idx + 1}</td>
        <td style="padding:8px;border:1px solid #eee;">${name}${color}</td>
        <td style="padding:8px;border:1px solid #eee;text-align:center;">${qty}</td>
        <td style="padding:8px;border:1px solid #eee;text-align:right;">৳${price}</td>
        <td style="padding:8px;border:1px solid #eee;text-align:right;">৳${
          price * qty
        }</td>
      </tr>`;
    })
    .join("");

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #eee;border-radius:10px;padding:16px;">
    <h2 style="margin:0;color:#db2777;">🛒 New Order Received</h2>
    <p style="margin:8px 0 0;color:#444;">Order ID: <b>${safe(orderId)}</b></p>

    <hr style="border:none;border-top:1px solid #eee;margin:14px 0;" />

    <h3 style="margin:0 0 8px;color:#111;">📌 Customer Info</h3>
    <p style="margin:4px 0;">Name: <b>${safe(customerName)}</b></p>
    <p style="margin:4px 0;">Phone: <b>${safe(customerPhone)}</b></p>
    <p style="margin:4px 0;">Address: <b>${safe(address)}</b></p>
    ${note ? `<p style="margin:4px 0;">Note: <b>${safe(note)}</b></p>` : ""}

    <hr style="border:none;border-top:1px solid #eee;margin:14px 0;" />

    <h3 style="margin:0 0 8px;color:#111;">🧾 Items</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr>
          <th style="padding:8px;border:1px solid #eee;text-align:left;">#</th>
          <th style="padding:8px;border:1px solid #eee;text-align:left;">Product</th>
          <th style="padding:8px;border:1px solid #eee;text-align:center;">Qty</th>
          <th style="padding:8px;border:1px solid #eee;text-align:right;">Price</th>
          <th style="padding:8px;border:1px solid #eee;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${
          itemsHtml ||
          `<tr><td colspan="5" style="padding:10px;border:1px solid #eee;">No items</td></tr>`
        }
      </tbody>
    </table>

    <hr style="border:none;border-top:1px solid #eee;margin:14px 0;" />

    <h3 style="margin:0 0 8px;color:#111;">💰 Summary</h3>
    <p style="margin:4px 0;">Subtotal: <b>৳${Number(subtotal || 0)}</b></p>
    <p style="margin:4px 0;">Delivery: <b>৳${Number(
      deliveryCharge || 0
    )}</b></p>
    <p style="margin:4px 0;">Discount: <b>৳${Number(discount || 0)}</b></p>
    <p style="margin:8px 0;font-size:18px;color:#db2777;">Grand Total: <b>৳${Number(
      total || 0
    )}</b></p>
    <p style="margin:4px 0;">Payment Method: <b>${safe(paymentMethod)}</b></p>

    <hr style="border:none;border-top:1px solid #eee;margin:14px 0;" />
    <p style="margin:0;color:#666;font-size:12px;">This is an automated notification.</p>
  </div>
  `;

  await transporter.sendMail({
    from: `"Order Notification" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🛒 New Order: ${orderId}`,
    html,
  });
}
