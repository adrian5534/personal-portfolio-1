/* eslint-env node */
const nodemailer = require('nodemailer');

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
  body: JSON.stringify(body),
});

const brand = {
  name: process.env.BRAND_NAME || 'YSB Academy LLC',
  address: process.env.BRAND_ADDRESS || 'Delaware, USA',
};
const portfolio = process.env.PORTFOLIO_NAME || 'Adrian Reynolds Portfolio';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' } };
  }
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

  try {
    const data = JSON.parse(event.body || '{}');
    for (const k of ['name', 'email', 'message']) {
      if (!String(data[k] || '').trim()) return json(400, { error: `Missing ${k}` });
    }

    const fromAddr = process.env.CONTACT_FROM || process.env.ZOHO_SMTP_USER; // e.g. "YSB Academy LLC | Adrian Reynolds <adrianreynolds@ysbacademy.online>"
    const toList = (process.env.CONTACT_TO || '').split(',').map(s => s.trim()).filter(Boolean);
    const port = Number(process.env.ZOHO_SMTP_PORT || 465);
    const secure = port === 465;

    if (!fromAddr || !process.env.ZOHO_SMTP_USER || !process.env.ZOHO_SMTP_PASS) {
      return json(500, { error: 'Mail server not configured' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
      port,
      secure,              // 465 SSL
      requireTLS: !secure, // 587 STARTTLS
      auth: { user: process.env.ZOHO_SMTP_USER, pass: process.env.ZOHO_SMTP_PASS },
    });

    // Optional verify in dev
    if (process.env.NETLIFY_DEV || process.env.NODE_ENV !== 'production') {
      try { await transporter.verify(); } catch (e) { console.error('SMTP verify failed:', e); }
    }

    const planTitle = data.planTitle || '';
    const subject = `${brand.name} Inquiry${planTitle ? ` — ${planTitle}` : ''} — ${data.name}`;

    const rows = [
      row('Name', data.name),
      row('Email', data.email),
      data.phone && row('Phone', data.phone),
      data.company && row('Company', data.company),
      data.website && row('Website', data.website),
      (data.city || data.region) && row('Location', [data.city, data.region].filter(Boolean).join(', ')),
      data.timeline && row('Timeline', data.timeline),
      data.preferredDate && row('Preferred date', data.preferredDate),
      planTitle && row('Selected plan', `${planTitle}${data.estimatedTotal ? ` (${data.estimatedTotal})` : ''}`),
    ].filter(Boolean).join('');

    const footer = `
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid #eee;color:#6b7280;font-size:12px">
        ${escapeHtml(brand.name)} • ${escapeHtml(brand.address)}
      </div>`;

    const adminHtml = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.55;color:#111827">
        <div style="padding:16px;border-bottom:1px solid #eee">
          <strong style="font-size:18px;color:#0b1220">${escapeHtml(brand.name)}</strong>
        </div>
        <div style="padding:16px">
          <h2 style="margin:0 0 12px 0;font-size:18px">New inquiry received</h2>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
            ${rows}
          </table>
          <h3 style="margin:16px 0 8px 0;font-size:16px">Message</h3>
          <div style="border:1px dashed #e5e7eb;border-radius:8px;padding:12px;background:#f9fafb">${nl2br(escapeHtml(data.message))}</div>
          ${footer}
        </div>
      </div>`;

    const adminText =
`New inquiry at ${brand.name}
${plain(rows)}
Message:
${String(data.message || '')}
—
${brand.name} • ${brand.address}`;

    // Send to your inboxes
    await transporter.sendMail({
      from: fromAddr,
      to: toList.length ? toList : fromAddr,
      subject,
      replyTo: `${data.name} <${data.email}>`,
      text: adminText,
      html: adminHtml,
      headers: { Organization: brand.name },
    });

    // Auto-reply to sender (exact phrasing requested)
    const arSubject = `Thanks For contacting ${portfolio} ${brand.name}`;
    const arHtml = `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;color:#111827">
      <div style="padding:16px;border-bottom:1px solid #eee"><strong>${escapeHtml(brand.name)}</strong></div>
      <div style="padding:16px">
        <p>Hi ${escapeHtml(data.name)},</p>
        <p>${escapeHtml(`Thanks For contacting ${portfolio} ${brand.name}`)}. I received your message and will reply within 24 hours.</p>
        ${planTitle ? `<p><strong>Selected plan:</strong> ${escapeHtml(planTitle)}${data.estimatedTotal ? ` (${escapeHtml(data.estimatedTotal)})` : ''}</p>` : ''}
        <p>Best,<br/>Adrian Reynolds<br/>${escapeHtml(brand.name)} • ${escapeHtml(brand.address)}</p>
      </div>
    </div>`;

    const arText =
`Hi ${data.name},

Thanks For contacting ${portfolio}. I received your message and will reply within 24 hours.

Best regards,
Adrian Reynolds
${brand.name} • ${brand.address}`;

    await transporter.sendMail({
      from: fromAddr,
      to: data.email,
      subject: arSubject,
      headers: { Organization: brand.name },
      text: arText,
      html: arHtml,
    });

    return json(200, { ok: true });
  } catch (err) {
    console.error('send-contact-email error', err);
    return json(500, { error: 'Failed to send message' });
  }
};

function row(label, value) {
  return `
    <tr>
      <td style="padding:10px 12px;background:#f9fafb;border-bottom:1px solid #eee;color:#374151;width:160px">${escapeHtml(label)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#0b1220">${escapeHtml(String(value))}</td>
    </tr>`;
}
function nl2br(t) { return String(t || '').replace(/\n/g, '<br/>'); }
function plain(htmlRows) { return htmlRows.replace(/<[^>]+>/g, '').replace(/\s+\n/g, '\n'); }
function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}