const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const EMAIL_LOG_PATH = path.join(__dirname, '..', 'logs', 'email.log');

function ensureLogDirectory() {
  const dir = path.dirname(EMAIL_LOG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureLogDirectory();

const isSmtpConfigured = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

const transporter = nodemailer.createTransport(
  isSmtpConfigured
    ? {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure:
        process.env.SMTP_SECURE === 'true' ||
        Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
    : {
      jsonTransport: true
    }
);

const defaultFrom = process.env.EMAIL_FROM || 'ProLab <no-reply@prolab.local>';

const templates = {
  welcome: ({ name }) =>
    `
      <h1>Welcome to ProLab Equipment</h1>
      <p>Hi ${name || 'there'},</p>
      <p>Thank you for creating an account with ProLab. You can now track orders, manage addresses and access member-only pricing.</p>
      <p>Regards,<br/>ProLab Team</p>
    `,
  orderConfirmation: ({ name, order }) =>
    `
      <h1>Order Confirmation #${order?.order_number || order?.orderId}</h1>
      <p>Hi ${name || 'there'},</p>
      <p>Thanks for your order! We are processing it and will notify you once it ships.</p>
      <p><strong>Total:</strong> ₹${Number(order?.total_amount || 0).toLocaleString()}</p>
      ${order?.shipping_details
      ? `<p><strong>Shipping Method:</strong> ${order.shipping_details.label} · ${order.shipping_details.eta}</p>`
      : ''
    }
      ${order?.items && order.items.length
      ? `<ul>${order.items
        .map(
          (item) =>
            `<li>${item.product_name || item.productName} × ${item.quantity
            }</li>`
        )
        .join('')}</ul>`
      : ''
    }
      <p>Regards,<br/>ProLab Fulfillment Team</p>
    `,
  orderStatus: ({ name, order, statusLabel, message }) =>
    `
      <h1>Update for Order #${order?.order_number || order?.orderId}</h1>
      <p>Hi ${name || 'there'},</p>
      <p><strong>Status:</strong> ${statusLabel}</p>
      ${message ? `<p>${message}</p>` : ''}
      ${order?.shipping_details
      ? `<p><strong>Shipping:</strong> ${order.shipping_details.label} · ${order.shipping_details.eta}</p>`
      : ''
    }
      <p>Total Amount: ₹${Number(order?.total_amount || 0).toLocaleString()}</p>
      <p>We'll keep you updated with future changes.</p>
      <p>Regards,<br/>ProLab Fulfillment Team</p>
    `
};

function renderTemplate(template, data) {
  if (typeof template === 'function') {
    return template(data);
  }
  if (templates[template]) {
    return templates[template](data);
  }
  return data?.html || '';
}

function logEmail(meta) {
  const entry = `[${new Date().toISOString()}] ${JSON.stringify(meta)}\n`;
  fs.appendFileSync(EMAIL_LOG_PATH, entry);
}

async function sendTransactionalEmail({
  to,
  subject,
  template,
  data = {},
  html,
  text
}) {
  if (!to) {
    console.warn('sendTransactionalEmail called without recipient');
    return { queued: false };
  }

  const htmlBody = html || renderTemplate(template, data);
  const textBody = text || htmlBody.replace(/<[^>]+>/g, '');

  const mailOptions = {
    from: defaultFrom,
    to,
    subject,
    html: htmlBody,
    text: textBody,
    ...(process.env.EMAIL_BCC && { bcc: process.env.EMAIL_BCC })
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    logEmail({
      to,
      subject,
      success: true,
      info: result,
      transport: isSmtpConfigured ? 'smtp' : 'json'
    });
    return { queued: true, id: result.messageId };
  } catch (error) {
    logEmail({
      to,
      subject,
      success: false,
      error: error.message
    });
    console.error('Email send failed:', error);
    return { queued: false, error: error.message };
  }
}

function sendOrderStatusEmail({ to, name, order, statusLabel, message }) {
  return sendTransactionalEmail({
    to,
    subject: `Order ${order?.order_number || ''} - ${statusLabel}`,
    template: 'orderStatus',
    data: {
      name,
      order,
      statusLabel,
      message
    }
  });
}

function sendOrderEmails(user, order) {
  if (!user || !user.email) return;

  const recipientName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

  return sendTransactionalEmail({
    to: user.email,
    subject: `Order Confirmation ${order.order_number}`,
    template: 'orderConfirmation',
    data: {
      name: recipientName,
      order: order
    }
  });
}

module.exports = {
  sendTransactionalEmail,
  sendOrderStatusEmail,
  sendOrderEmails,
  isSmtpConfigured
};
