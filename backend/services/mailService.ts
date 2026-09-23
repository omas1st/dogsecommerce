import nodemailer, { Transporter } from 'nodemailer';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || 'omas7th@gmail.com';

class MailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const user = process.env.SMTP_USER || 'omas7th@gmail.com';
    const pass = (process.env.SMTP_PASS || 'yikw vrcs aveh vcrt').replace(/\s+/g, '');
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const secure = process.env.SMTP_SECURE !== 'false';

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      this.isConfigured = true;
      console.log(`[MailService] Configured with ${host}:${port} for ${user}`);
    } catch (err) {
      console.error('[MailService] Failed to configure nodemailer transporter:', err);
      this.isConfigured = false;
    }
  }

  public async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<boolean> {
    if (!this.transporter) {
      this.initTransporter();
    }
    if (!this.transporter) {
      console.warn('[MailService] No transporter available to send email to', options.to);
      return false;
    }

    const fromAddress = process.env.EMAIL_FROM || '"Hound & Harbor" <omas7th@gmail.com>';

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]+>/g, ''),
      });
      console.log(`[MailService] Email successfully sent to ${options.to}. ID: ${info.messageId}`);
      return true;
    } catch (error: any) {
      console.error(`[MailService] Failed to send email to ${options.to}:`, error.message);
      return false;
    }
  }

  // Notify admin of a new customer order
  public async notifyAdminNewOrder(order: any) {
    const itemsHtml = (order.items || [])
      .map(
        (item: any) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name || item.title || 'Product'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity || 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
          </tr>`
      )
      .join('');

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: #0E5E58; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🐾 New Order Received</h1>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Order #${order.orderNumber || order.id}</p>
        </div>
        <div style="padding: 24px; color: #1f2937;">
          <p style="font-size: 16px;">Hello Admin,</p>
          <p>A new order has been placed on <strong>Hound & Harbor</strong>.</p>
          
          <div style="background: #f9fafb; padding: 16px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Customer:</strong> ${order.customerName || 'Guest'}</p>
            <p style="margin: 4px 0;"><strong>Customer Email:</strong> <a href="mailto:${order.customerEmail}">${order.customerEmail}</a></p>
            <p style="margin: 4px 0;"><strong>Order Status:</strong> <span style="color: #0E5E58; font-weight: bold;">${order.orderStatus || 'confirmed'}</span></p>
            <p style="margin: 4px 0;"><strong>Payment Status:</strong> ${order.paymentStatus || 'paid'} (${order.paymentMethod || 'Credit Card'})</p>
            <p style="margin: 4px 0;"><strong>Shipping Destination:</strong> ${order.shippingAddress?.fullName ? `(${order.shippingAddress.fullName}) ` : ''}${order.shippingAddress?.streetAddress || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zipCode || ''}</p>
            <p style="margin: 4px 0;"><strong>Billing Address:</strong> ${order.billingAddress?.fullName ? `(${order.billingAddress.fullName}) ` : ''}${order.billingAddress?.streetAddress || order.shippingAddress?.streetAddress || ''}, ${order.billingAddress?.city || order.shippingAddress?.city || ''}, ${order.billingAddress?.state || order.shippingAddress?.state || ''} ${order.billingAddress?.zipCode || order.shippingAddress?.zipCode || ''}</p>
          </div>

          <h3 style="font-size: 16px; border-bottom: 2px solid #0E5E58; padding-bottom: 8px; margin-top: 24px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 8px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 8px; font-weight: bold; text-align: right;">Subtotal:</td>
                <td style="padding: 8px; font-weight: bold; text-align: right;">$${(order.subtotal || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 8px; font-weight: bold; text-align: right;">Shipping:</td>
                <td style="padding: 8px; font-weight: bold; text-align: right;">$${(order.shippingCost || 0).toFixed(2)}</td>
              </tr>
              <tr style="font-size: 16px; background: #f9fafb;">
                <td colspan="2" style="padding: 10px 8px; font-weight: bold; text-align: right; color: #0E5E58;">Grand Total:</td>
                <td style="padding: 10px 8px; font-weight: bold; text-align: right; color: #0E5E58;">$${(order.total || 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 24px; text-align: center;">
            <a href="${process.env.APP_URL || ''}/#admin" style="background: #0E5E58; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View in Admin Dashboard</a>
          </div>
        </div>
      </div>
    `;

    await this.sendMail({
      to: ADMIN_EMAIL,
      subject: `🐾 [Hound & Harbor] New Order #${order.orderNumber} - $${(order.total || 0).toFixed(2)}`,
      html,
    });

    // Also send confirmation to customer
    if (order.customerEmail) {
      await this.sendMail({
        to: order.customerEmail,
        subject: `Order Confirmed #${order.orderNumber} - Hound & Harbor`,
        html: html.replace('Hello Admin,', `Hello ${order.customerName || 'Customer'},`).replace('A new order has been placed', 'Thank you for your order'),
      });
    }
  }

  // Notify admin of a new user sign up
  public async notifyAdminNewUser(user: any) {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: #0E5E58; padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px;">👤 New User Account Created</h2>
        </div>
        <div style="padding: 24px; color: #1f2937;">
          <p>Hello Admin,</p>
          <p>A new customer has just registered on the Hound & Harbor platform:</p>
          <div style="background: #f9fafb; padding: 16px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${user.email}">${user.email}</a></p>
            <p style="margin: 4px 0;"><strong>Phone:</strong> ${user.phone || 'Not specified'}</p>
            <p style="margin: 4px 0;"><strong>Role:</strong> ${user.role || 'customer'}</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    `;

    await this.sendMail({
      to: ADMIN_EMAIL,
      subject: `👤 [Hound & Harbor] New User Registration: ${user.firstName} ${user.lastName} (${user.email})`,
      html,
    });
  }

  // Notify admin of a new support inquiry or ticket
  public async notifyAdminSupportTicket(ticket: any) {
    const messageContent = ticket.message || ticket.initialMessage || ticket.messages?.[0]?.content || '';
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: #0E5E58; padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px;">📩 Customer In-App Message / Support Ticket</h2>
        </div>
        <div style="padding: 24px; color: #1f2937;">
          <p>Hello Admin,</p>
          <p>A customer has submitted a new in-app message through Hound & Harbor customer care:</p>
          <div style="background: #f9fafb; padding: 16px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Ticket / Message Ref:</strong> ${ticket.ticketNumber || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Subject:</strong> ${ticket.subject}</p>
            <p style="margin: 4px 0;"><strong>Category:</strong> ${ticket.category || 'General Inquiry'}</p>
            <p style="margin: 4px 0;"><strong>Customer Name:</strong> ${ticket.customerName || 'Valued Customer'}</p>
            <p style="margin: 4px 0;"><strong>Customer Email:</strong> <a href="mailto:${ticket.customerEmail}">${ticket.customerEmail}</a></p>
            <p style="margin: 4px 0;"><strong>Order ID:</strong> ${ticket.orderId || 'N/A'}</p>
            <div style="margin-top: 12px; padding: 12px; background: #ffffff; border-left: 4px solid #0E5E58; border-radius: 4px;">
              <p style="margin: 0; font-style: italic; white-space: pre-wrap;">"${messageContent}"</p>
            </div>
          </div>
          <p>You can reply directly to this email or reach the customer at <a href="mailto:${ticket.customerEmail}">${ticket.customerEmail}</a>.</p>
        </div>
      </div>
    `;

    await this.sendMail({
      to: ADMIN_EMAIL,
      subject: `📩 [In-App Message] ${ticket.subject} (From: ${ticket.customerEmail})`,
      html,
    });
  }

  // Notify admin of a new dog marketplace listing
  public async notifyAdminNewListing(listing: any) {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: #0E5E58; padding: 20px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px;">🐕 New Dog Marketplace Submission</h2>
        </div>
        <div style="padding: 24px; color: #1f2937;">
          <p>Hello Admin,</p>
          <p>A new dog listing has been submitted for review on Hound & Harbor:</p>
          <div style="background: #f9fafb; padding: 16px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Dog Name:</strong> ${listing.name}</p>
            <p style="margin: 4px 0;"><strong>Breed:</strong> ${listing.breed}</p>
            <p style="margin: 4px 0;"><strong>Age:</strong> ${listing.age}</p>
            <p style="margin: 4px 0;"><strong>Price / Adoption Fee:</strong> $${listing.price || listing.adoptionFee || 0}</p>
            <p style="margin: 4px 0;"><strong>Seller / Contact:</strong> ${listing.sellerEmail || listing.contactEmail || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Location:</strong> ${listing.location?.city || ''}, ${listing.location?.state || ''}</p>
          </div>
        </div>
      </div>
    `;

    await this.sendMail({
      to: ADMIN_EMAIL,
      subject: `🐕 [Hound & Harbor] New Dog Submission: ${listing.name} (${listing.breed})`,
      html,
    });
  }
}

export const mailService = new MailService();
