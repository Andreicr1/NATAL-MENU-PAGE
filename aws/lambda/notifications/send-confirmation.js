/**
 * Send Order Confirmation - Email & WhatsApp
 * Enterprise-grade notification service
 *
 * Features:
 * - Email via Amazon SES
 * - WhatsApp via Twilio or Evolution API
 * - Retry logic with exponential backoff
 * - Comprehensive error handling
 * - Detailed logging for debugging
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');
const sgMail = require('@sendgrid/mail');

// Initialize clients
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
});
const secretsClient = new SecretsManagerClient({});

// Cache for secrets
let twilioCredentials = null;
let sendGridApiKey = null;

// Email provider preference: 'sendgrid' or 'ses'
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'sendgrid';

/**
 * Main handler
 */
exports.handler = async event => {
  console.log('[NOTIFICATION] Event received:', JSON.stringify(event, null, 2));

  try {
    // Extract orderId from various sources
    const orderId =
      event.orderId ||
      (event.body ? JSON.parse(event.body).orderId : null) ||
      event.Records?.[0]?.dynamodb?.NewImage?.orderId?.S;

    if (!orderId) {
      throw new Error('Missing orderId in event');
    }

    console.log('[NOTIFICATION] Processing order:', orderId);

    // Fetch order details
    const order = await fetchOrderDetails(orderId);

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // Validate payment status
    if (order.paymentStatus !== 'approved') {
      console.log(
        '[NOTIFICATION] Payment not approved yet, skipping. Status:',
        order.paymentStatus
      );
      return {
        statusCode: 200,
        body: JSON.stringify({
          skipped: true,
          reason: 'Payment not approved',
          paymentStatus: order.paymentStatus,
        }),
      };
    }

    // Validate required fields
    if (!order.customerEmail) {
      throw new Error('Missing customer email');
    }

    const results = {
      orderId,
      email: { sent: false, error: null },
      whatsapp: { sent: false, error: null },
    };

    // Send Email (with retry)
    try {
      await sendEmailWithRetry(order);
      results.email.sent = true;
      console.log(
        '[NOTIFICATION] Email sent successfully to:',
        order.customerEmail
      );
    } catch (error) {
      results.email.error = error.message;
      console.error('[NOTIFICATION] Email failed:', error);
    }

    // Send WhatsApp (with retry) - only if phone exists
    if (order.customerPhone) {
      try {
        await sendWhatsAppWithRetry(order);
        results.whatsapp.sent = true;
        console.log(
          '[NOTIFICATION] WhatsApp sent successfully to:',
          order.customerPhone
        );
      } catch (error) {
        results.whatsapp.error = error.message;
        console.error('[NOTIFICATION] WhatsApp failed:', error);
      }
    } else {
      console.log('[NOTIFICATION] No phone number, skipping WhatsApp');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(results),
    };
  } catch (error) {
    console.error('[NOTIFICATION] Critical error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }),
    };
  }
};

/**
 * Fetch order details from DynamoDB
 */
async function fetchOrderDetails(orderId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: process.env.ORDERS_TABLE,
      Key: { orderId },
    })
  );

  return result.Item;
}

/**
 * Send email with retry logic
 */
async function sendEmailWithRetry(order, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sendEmail(order);
      return;
    } catch (error) {
      console.error(
        `[EMAIL] Attempt ${attempt}/${maxRetries} failed:`,
        error.message
      );
      if (attempt === maxRetries) throw error;

      // Exponential backoff: 1s, 2s, 4s
      await sleep(Math.pow(2, attempt - 1) * 1000);
    }
  }
}

/**
 * Send WhatsApp with retry logic
 */
async function sendWhatsAppWithRetry(order, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sendWhatsApp(order);
      return;
    } catch (error) {
      console.error(
        `[WHATSAPP] Attempt ${attempt}/${maxRetries} failed:`,
        error.message
      );
      if (attempt === maxRetries) throw error;

      // Exponential backoff
      await sleep(Math.pow(2, attempt - 1) * 1000);
    }
  }
}

/**
 * Get SendGrid API Key from Secrets Manager
 */
async function getSendGridApiKey() {
  if (sendGridApiKey) return sendGridApiKey;

  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({ SecretId: process.env.SECRET_NAME })
    );
    const secret = JSON.parse(response.SecretString);
    sendGridApiKey = secret.sendgrid_api_key || secret.SENDGRID_API_KEY;
    return sendGridApiKey;
  } catch (error) {
    console.error('[SENDGRID] Failed to get API key:', error);
    throw error;
  }
}

/**
 * Send confirmation email via SendGrid or SES
 */
async function sendEmail(order) {
  if (EMAIL_PROVIDER === 'sendgrid') {
    return await sendEmailViaSendGrid(order);
  } else {
    return await sendEmailViaSES(order);
  }
}

/**
 * Send email via SendGrid (Recommended - No approval needed!)
 */
async function sendEmailViaSendGrid(order) {
  const apiKey = await getSendGridApiKey();
  sgMail.setApiKey(apiKey);

  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@sweetbarchocolates.com.br';
  const fromName = process.env.SENDGRID_FROM_NAME || 'Sweet Bar Chocolates';
  const replyToEmail = process.env.SES_REPLY_TO_EMAIL || 'contato@sweetbarchocolates.com.br';

  const orderDate = new Date(order.createdAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const emailHtml = generateEmailTemplate(order, orderDate);
  const emailText = generateEmailText(order, orderDate);

  const msg = {
    to: order.customerEmail,
    from: {
      email: fromEmail,
      name: fromName
    },
    replyTo: replyToEmail,
    subject: `Pedido Confirmado - Sweet Bar #${order.orderNumber || order.orderId.substring(0, 8).toUpperCase()}`,
    text: emailText,
    html: emailHtml,
    trackingSettings: {
      clickTracking: { enable: false },
      openTracking: { enable: true }
    },
    customArgs: {
      orderId: order.orderId,
      orderNumber: order.orderNumber || '',
      transactionId: order.transactionId || order.paymentId || '',
      type: 'order_confirmation'
    }
  };

  console.log('[SENDGRID] Sending email to:', order.customerEmail);

  const response = await sgMail.send(msg);
  console.log('[SENDGRID] Email sent successfully! Status:', response[0].statusCode);
  console.log('[SENDGRID] Message ID:', response[0].headers['x-message-id']);

  return response;
}

/**
 * Send email via AWS SES (Fallback - Requires approval)
 */
async function sendEmailViaSES(order) {
  const fromEmail =
    process.env.SES_FROM_EMAIL || 'noreply@sweetbarchocolates.com.br';
  const replyToEmail =
    process.env.SES_REPLY_TO_EMAIL || 'contato@sweetbarchocolates.com.br';

  const orderDate = new Date(order.createdAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const emailHtml = generateEmailTemplate(order, orderDate);
  const emailText = generateEmailText(order, orderDate);

  const params = {
    Source: fromEmail,
    ReplyToAddresses: [replyToEmail],
    Destination: {
      ToAddresses: [order.customerEmail],
      BccAddresses: [process.env.BCC_EMAIL].filter(Boolean), // Admin copy
    },
    Message: {
      Subject: {
        Data: `🎄 Pedido Confirmado - Sweet Bar #${order.orderNumber || order.orderId.substring(0, 8).toUpperCase()}`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: emailHtml,
          Charset: 'UTF-8',
        },
        Text: {
          Data: emailText,
          Charset: 'UTF-8',
        },
      },
    },
    // Add tags for tracking
    Tags: [
      { Name: 'Type', Value: 'OrderConfirmation' },
      { Name: 'OrderId', Value: order.orderId },
    ],
  };

  const command = new SendEmailCommand(params);
  const response = await sesClient.send(command);

  console.log('[SES] MessageId:', response.MessageId);
  return response;
}

/**
 * Generate HTML email template
 */
function generateEmailTemplate(order, orderDate) {
  if (!orderDate) {
    orderDate = new Date(order.createdAt).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Pedido - Sweet Bar</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      background-color: #f5f5f5;
      padding: 20px;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #5c0108;
      color: #d4af37;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
      font-weight: normal;
    }
    .header p {
      font-size: 16px;
      color: #fbf7e8;
    }
    .content {
      background-color: #fbf7e8;
      padding: 40px 30px;
    }
    .content h2 {
      color: #5c0108;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content p {
      color: #5c0108;
      margin-bottom: 15px;
      font-size: 16px;
    }
    .order-info {
      background-color: white;
      border: 2px solid #d4af37;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
    }
    .order-number {
      color: #d4af37;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .product-list {
      margin: 20px 0;
    }
    .product-item {
      border-bottom: 1px solid #e8e8e8;
      padding: 15px 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .product-item:last-child {
      border-bottom: none;
    }
    .product-details {
      flex: 1;
    }
    .product-name {
      color: #5c0108;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .product-quantity {
      color: #666;
      font-size: 14px;
    }
    .product-price {
      color: #d4af37;
      font-weight: bold;
      white-space: nowrap;
      margin-left: 15px;
    }
    .totals {
      border-top: 2px solid #d4af37;
      margin-top: 20px;
      padding-top: 15px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .total-row.final {
      font-size: 20px;
      font-weight: bold;
      color: #5c0108;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #d4af37;
    }
    .total-row.final .amount {
      color: #d4af37;
    }
    .address-box {
      background-color: white;
      border: 1px solid #d4af37;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .address-box h4 {
      color: #5c0108;
      margin-bottom: 12px;
    }
    .address-box p {
      margin: 5px 0;
      font-size: 15px;
    }
    .delivery-info {
      background-color: #fff8e1;
      border-left: 4px solid #d4af37;
      padding: 20px;
      margin: 25px 0;
    }
    .delivery-info h4 {
      color: #5c0108;
      margin-bottom: 10px;
    }
    .cta-button {
      display: inline-block;
      background-color: #5c0108;
      color: #fbf7e8;
      padding: 15px 35px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
      transition: background-color 0.3s;
    }
    .cta-button:hover {
      background-color: #7c1c3d;
    }
    .footer {
      background-color: #5c0108;
      color: #fbf7e8;
      padding: 30px;
      text-align: center;
    }
    .footer p {
      margin: 8px 0;
      color: #fbf7e8;
    }
    .footer a {
      color: #d4af37;
      text-decoration: none;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #d4af37;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content, .header, .footer {
        padding: 20px 15px;
      }
      .header h1 {
        font-size: 24px;
      }
      .product-item {
        flex-direction: column;
      }
      .product-price {
        margin-left: 0;
        margin-top: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>Sweet Bar Chocolates</h1>
      <p>Ateliê de Chocolate Premium</p>
    </div>

    <!-- Content -->
    <div class="content">
      <h2>Olá ${order.customerName}!</h2>
      <p>Seu pedido foi <strong>confirmado com sucesso</strong> e já está sendo preparado com todo carinho!</p>

      <!-- Order Info -->
      <div class="order-info">
        <div class="order-number">
          Pedido #${order.orderNumber || order.orderId.substring(0, 8).toUpperCase()}
        </div>
        <p style="margin: 0; color: #666; font-size: 14px;">
          Realizado em: ${orderDate}
        </p>
        ${order.transactionId || order.paymentId ? `
        <p style="margin: 8px 0 0 0; color: #666; font-size: 13px;">
          <strong>ID da Transação:</strong> <span style="font-family: monospace; color: #8b5cf6;">${order.transactionId || order.paymentId}</span>
        </p>
        ` : ''}

        <!-- Products -->
        <div class="product-list">
          <h4 style="color: #5c0108; margin: 20px 0 15px 0;">Itens do Pedido:</h4>
          ${order.items
            .map(
              item => `
            <div class="product-item">
              <div class="product-details">
                <div class="product-name">${item.name}</div>
                <div class="product-quantity">Quantidade: ${item.quantity}</div>
              </div>
              <div class="product-price">R$ ${(
                item.priceValue * item.quantity
              ).toFixed(2)}</div>
            </div>
          `
            )
            .join('')}
        </div>

        <!-- Totals -->
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>R$ ${order.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Frete:</span>
            <span>R$ ${order.shippingCost.toFixed(2)}</span>
          </div>
          <div class="total-row final">
            <span>TOTAL:</span>
            <span class="amount">R$ ${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <!-- Delivery Address -->
      <div class="address-box">
        <h4>Endereço de Entrega</h4>
        <p>${order.shippingAddress.street}, ${order.shippingAddress.number}</p>
        ${
          order.shippingAddress.complement
            ? `<p>${order.shippingAddress.complement}</p>`
            : ''
        }
        <p>${order.shippingAddress.neighborhood}</p>
        <p>${order.shippingAddress.city} - ${order.shippingAddress.state}</p>
        <p>CEP: ${formatCEP(order.shippingAddress.zipCode)}</p>
      </div>

      <!-- Delivery Info -->
      <div class="delivery-info">
        <h4>Informações de Entrega</h4>
        <p><strong>Datas disponíveis:</strong> 22, 23 ou 24 de dezembro de 2024</p>
        <p><strong>Horário:</strong> Das 8h às 22h</p>
        <p style="margin-top: 15px;">
          <strong>Atenção:</strong> Entraremos em contato pelo WhatsApp <strong>${formatPhone(
            order.customerPhone
          )}</strong>
          para combinar o melhor horário de entrega!
        </p>
      </div>

      <p style="margin-top: 30px; text-align: center;">
        <a href="https://wa.me/5548991960811?text=Ol%C3%A1!%20Tenho%20uma%20d%C3%BAvida%20sobre%20o%20pedido%20${order.orderNumber || order.orderId.substring(0, 8).toUpperCase()}"
           class="cta-button">
          Falar com a Sweet Bar
        </a>
      </p>

      <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
        Qualquer dúvida, estamos à disposição!<br>
        Equipe Sweet Bar
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Sweet Bar Chocolates</strong></p>
      <p>Chocolates Artesanais Premium</p>
      <p style="margin-top: 15px;">
        WhatsApp: (48) 99196-0811<br>
        Email: contato@sweetbarchocolates.com.br
      </p>
      <div class="social-links">
        <a href="https://www.instagram.com/sweetbar.br" target="_blank">
          Instagram: @sweetbar.br
        </a>
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #d4af37;">
        © 2024 Sweet Bar - Todos os direitos reservados
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate plain text email
 */
function generateEmailText(order, orderDate) {
  if (!orderDate) {
    orderDate = new Date(order.createdAt).toLocaleString('pt-BR');
  }

  return `
SWEET BAR CHOCOLATES - Confirmação de Pedido

Olá ${order.customerName}!

Seu pedido foi CONFIRMADO com sucesso!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PEDIDO #${order.orderNumber || order.orderId.substring(0, 8).toUpperCase()}
Data: ${orderDate}
${order.transactionId || order.paymentId ? `ID da Transação: ${order.transactionId || order.paymentId}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ITENS:
${order.items
  .map(
    item =>
      `• ${item.name}\n  Qtd: ${item.quantity} x R$ ${item.priceValue.toFixed(
        2
      )} = R$ ${(item.priceValue * item.quantity).toFixed(2)}`
  )
  .join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal: R$ ${order.subtotal.toFixed(2)}
Frete:    R$ ${order.shippingCost.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:    R$ ${order.total.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENDEREÇO DE ENTREGA:
${order.shippingAddress.street}, ${order.shippingAddress.number}
${
  order.shippingAddress.complement
    ? order.shippingAddress.complement + '\n'
    : ''
}${order.shippingAddress.neighborhood}
${order.shippingAddress.city} - ${order.shippingAddress.state}
CEP: ${formatCEP(order.shippingAddress.zipCode)}

ENTREGA DE NATAL:
• Datas: 22, 23 ou 24 de dezembro
• Horário: 8h às 22h

Entraremos em contato pelo WhatsApp ${formatPhone(order.customerPhone)}
para combinar o melhor horário!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dúvidas? Fale conosco:
WhatsApp: (48) 99196-0811
Instagram: @sweetbar.br
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Obrigado pela preferência!
Equipe Sweet Bar
  `.trim();
}

/**
 * Send WhatsApp message
 */
async function sendWhatsApp(order) {
  const phone = formatPhoneForWhatsApp(order.customerPhone);
  const message = generateWhatsAppMessage(order);

  // Try Twilio first
  const twilioEnabled =
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;

  if (twilioEnabled) {
    await sendViaTwilio(phone, message);
    return;
  }

  // Fallback to Evolution API
  const evolutionEnabled =
    process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY;

  if (evolutionEnabled) {
    await sendViaEvolution(phone, message);
    return;
  }

  throw new Error('No WhatsApp provider configured (Twilio or Evolution API)');
}

/**
 * Send WhatsApp via Twilio
 */
async function sendViaTwilio(phone, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber =
    process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: `whatsapp:+${phone}`,
        Body: message,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twilio error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  console.log('[WHATSAPP] Twilio SID:', result.sid);
  return result;
}

/**
 * Send WhatsApp via Evolution API
 */
async function sendViaEvolution(phone, message) {
  const apiUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE || 'sweetbar';

  const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
    method: 'POST',
    headers: {
      apikey: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      number: phone,
      textMessage: {
        text: message,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Evolution API error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  console.log('[WHATSAPP] Evolution API response:', result);
  return result;
}

/**
 * Generate WhatsApp message
 */
function generateWhatsAppMessage(order) {
  return `
*Sweet Bar Chocolates*

Olá *${order.customerName}*!

Seu pedido foi *confirmado com sucesso*!

━━━━━━━━━━━━━━━━━━━━━
*Pedido #${order.orderNumber || order.orderId.substring(0, 8).toUpperCase()}*
${order.transactionId || order.paymentId ? `ID Transação: ${order.transactionId || order.paymentId}` : ''}
━━━━━━━━━━━━━━━━━━━━━

*Itens:*
${order.items
  .map(
    item =>
      `• ${item.name}\n  ${item.quantity}x R$ ${item.priceValue.toFixed(
        2
      )} = R$ ${(item.priceValue * item.quantity).toFixed(2)}`
  )
  .join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━
Subtotal: R$ ${order.subtotal.toFixed(2)}
Frete: R$ ${order.shippingCost.toFixed(2)}
*TOTAL: R$ ${order.total.toFixed(2)}*
━━━━━━━━━━━━━━━━━━━━━

*Entrega em:*
${order.shippingAddress.street}, ${order.shippingAddress.number}
${order.shippingAddress.neighborhood}
${order.shippingAddress.city} - ${order.shippingAddress.state}
CEP: ${formatCEP(order.shippingAddress.zipCode)}

*Entrega de Natal:*
Dias: 22, 23 ou 24 de dezembro
Horário: 8h às 22h

Em breve entraremos em contato para combinar o melhor horário de entrega!

Obrigado pela preferência!

_Sweet Bar - Chocolates Artesanais Premium_
  `.trim();
}

/**
 * Helper: Format CEP
 */
function formatCEP(cep) {
  const clean = cep.replace(/\D/g, '');
  if (clean.length === 8) {
    return `${clean.substring(0, 5)}-${clean.substring(5)}`;
  }
  return cep;
}

/**
 * Helper: Format phone for display
 */
function formatPhone(phone) {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) {
    return `(${clean.substring(0, 2)}) ${clean.substring(
      2,
      7
    )}-${clean.substring(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.substring(0, 2)}) ${clean.substring(
      2,
      6
    )}-${clean.substring(6)}`;
  }
  return phone;
}

/**
 * Helper: Format phone for WhatsApp API
 */
function formatPhoneForWhatsApp(phone) {
  const clean = phone.replace(/\D/g, '');
  return `55${clean}`; // Brasil country code
}

/**
 * Helper: Sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
