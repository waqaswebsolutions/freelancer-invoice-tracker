export function getInvoiceEmailTemplate(invoice, client, invoiceNumber, settings = {}) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', JPY: '¥', INR: '₹'
    };
    return symbols[currency] || '$';
  };

  const companyName = settings?.companyName || 'Your Business';
  const companyEmail = settings?.businessEmail || settings?.senderEmail || '';
  const companyPhone = settings?.businessPhone || '';
  const companyAddress = settings?.businessAddress || {};
  const currencySymbol = getCurrencySymbol(settings?.currency || 'USD');
  const emailMessage = settings?.emailTemplate || 'Thank you for your business! Please find your invoice attached.';

  const formatAddress = () => {
    const parts = [
      companyAddress.street,
      companyAddress.city,
      companyAddress.state,
      companyAddress.zipCode,
      companyAddress.country
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice from ${companyName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .email-wrapper {
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0 0;
          opacity: 0.9;
          font-size: 14px;
        }
        .content {
          padding: 30px 25px;
        }
        .company-info {
          text-align: right;
          margin-bottom: 20px;
          font-size: 14px;
          color: #666;
        }
        .invoice-details {
          background-color: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid #4f46e5;
        }
        .amount {
          font-size: 32px;
          font-weight: bold;
          color: #4f46e5;
          margin: 10px 0;
        }
        .invoice-items {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        .invoice-items th {
          text-align: left;
          padding: 8px;
          border-bottom: 2px solid #e5e7eb;
          color: #6b7280;
          font-weight: 600;
        }
        .invoice-items td {
          padding: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .total-row {
          font-weight: bold;
          border-top: 2px solid #e5e7eb;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }
        .button {
          display: inline-block;
          background-color: #4f46e5;
          color: white;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: 600;
          text-align: center;
        }
        .button:hover {
          background-color: #4338ca;
        }
        .note {
          background-color: #fef3c7;
          padding: 12px;
          border-radius: 6px;
          margin: 15px 0;
          font-size: 14px;
          color: #92400e;
        }
        .message {
          background-color: #f0fdf4;
          padding: 12px;
          border-radius: 6px;
          margin: 15px 0;
          font-size: 14px;
          color: #166534;
          border-left: 3px solid #22c55e;
        }
        hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <h1>📄 New Invoice</h1>
            <p>${invoiceNumber}</p>
          </div>
          
          <div class="content">
            ${companyName !== 'Your Business' ? `
              <div class="company-info">
                <strong>${companyName}</strong><br>
                ${companyEmail ? `${companyEmail}<br>` : ''}
                ${companyPhone ? `${companyPhone}<br>` : ''}
                ${formatAddress() ? `${formatAddress()}<br>` : ''}
              </div>
            ` : ''}
            
            <p>Dear <strong>${client.name}</strong>,</p>
            
            <div class="message">
              ${emailMessage}
            </div>
            
            <div class="invoice-details">
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Invoice Date:</strong> ${formatDate(invoice.createdAt)}</p>
              <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
              <p><strong>Total Amount Due:</strong></p>
              <div class="amount">${currencySymbol}${invoice.total.toFixed(2)}</div>
            </div>
            
            <h3>Invoice Items</h3>
            <table class="invoice-items">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Qty</th>
                  <th style="text-align: right;">Rate</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td style="text-align: right;">${item.quantity}</td>
                    <td style="text-align: right;">${currencySymbol}${item.rate.toFixed(2)}</td>
                    <td style="text-align: right;">${currencySymbol}${item.amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
                  <td style="text-align: right;">${currencySymbol}${invoice.subtotal.toFixed(2)}</td>
                </tr>
                ${invoice.tax > 0 ? `
                <tr>
                  <td colspan="3" style="text-align: right;"><strong>Tax (${invoice.tax}%):</strong></td>
                  <td style="text-align: right;">${currencySymbol}${(invoice.subtotal * invoice.tax / 100).toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                  <td style="text-align: right;"><strong>${currencySymbol}${invoice.total.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
            
            ${invoice.notes ? `
              <div class="note">
                <strong>📝 Notes:</strong><br>
                ${invoice.notes}
              </div>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/invoices/${invoice._id}" class="button">View Invoice Online</a>
            </div>
            
            <hr>
            
            <p style="font-size: 13px; color: #6b7280; text-align: center;">
              If you have any questions about this invoice, please contact us at ${companyEmail || 'support@yourbusiness.com'}
            </p>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}