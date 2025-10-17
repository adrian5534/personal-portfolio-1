/* eslint-env node */
const nodemailer = require('nodemailer');

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' } };
  }
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

  try {
    const data = JSON.parse(event.body || '{}');

    const required = ['name', 'email', 'message'];
    for (const k of required) {
      if (!String(data[k] || '').trim()) return json(400, { error: `Missing ${k}` });
    }

    const fromAddr = process.env.CONTACT_FROM || process.env.ZOHO_SMTP_USER;
    const toList = (process.env.CONTACT_TO || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!fromAddr || !process.env.ZOHO_SMTP_USER || !process.env.ZOHO_SMTP_PASS) {
      return json(500, { error: 'Mail server not configured' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
      port: Number(process.env.ZOHO_SMTP_PORT || 465),
      secure: true,
      auth: { user: process.env.ZOHO_SMTP_USER, pass: process.env.ZOHO_SMTP_PASS },
    });

    const planTitle = data.planTitle || '';
    const subject =
      `New inquiry${planTitle ? `: ${planTitle}` : ''} — ${data.name}`;

    const lines = [
      `<strong>Name:</strong> ${escapeHtml(data.name)}`,
      `<strong>Email:</strong> ${escapeHtml(data.email)}`,
      data.phone ? `<strong>Phone:</strong> ${escapeHtml(data.phone)}` : '',
      data.company ? `<strong>Company:</strong> ${escapeHtml(data.company)}` : '',
      data.website ? `<strong>Website:</strong> ${escapeHtml(data.website)}` : '',
      (data.city || data.region) ? `<strong>Location:</strong> ${escapeHtml([data.city, data.region].filter(Boolean).join(', '))}` : '',
      data.timeline ? `<strong>Timeline:</strong> ${escapeHtml(data.timeline)}` : '',
      data.preferredDate ? `<strong>Preferred date:</strong> ${escapeHtml(data.preferredDate)}` : '',
      planTitle ? `<strong>Selected plan:</strong> ${escapeHtml(planTitle)}${data.estimatedTotal ? ` (${escapeHtml(data.estimatedTotal)})` : ''}` : '',
      '<hr />',
      `<strong>Message</strong><br />${nl2br(escapeHtml(data.message))}`,
    ].filter(Boolean);

    // 1) Send to you (To + optional CC list)
    await transporter.sendMail({
      from: fromAddr,            // must be your Zoho mailbox
      to: toList.length ? toList : fromAddr,
      subject,
      replyTo: `${data.name} <${data.email}>`,
      text: toPlainText(lines.join('\n')),
      html: `<div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height:1.5;">${lines.join('<br/>')}</div>`,
    });

    // 2) Auto‑reply to sender
    await transporter.sendMail({
      from: fromAddr,
      to: data.email,
      subject: 'Thanks for your inquiry',
      text: `Hi ${data.name},

Thanks for reaching out! I received your message and will reply within 24 hours.

— Adrian
`,
      html: `<p>Hi ${escapeHtml(data.name)},</p><p>Thanks for reaching out! I received your message and will reply within 24 hours.</p><p>— Adrian</p>`,
    });

    return json(200, { ok: true });
  } catch (err) {
    console.error('send-contact-email error', err);
    return json(500, { error: 'Failed to send message' });
  }
};

function nl2br(t) { return String(t || '').replace(/\n/g, '<br/>'); }
function toPlainText(html) { return String(html || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' '); }
function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}