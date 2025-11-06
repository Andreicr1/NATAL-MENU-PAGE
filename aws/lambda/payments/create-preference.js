const { MercadoPagoConfig, Preference } = require('mercadopago');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const secretsClient = new SecretsManagerClient({});
let cachedToken = null;

async function getAccessToken() {
  if (cachedToken) return cachedToken;

  const command = new GetSecretValueCommand({ SecretId: process.env.SECRET_NAME });
  const response = await secretsClient.send(command);
  const secret = JSON.parse(response.SecretString);
  cachedToken = secret.access_token;
  return cachedToken;
}

function generateIdempotencyKey() {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };

  if (event.requestContext.http.method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const {
      items,
      payer,
      back_urls,
      backUrls, // suporte a ambos os formatos
      auto_return,
      external_reference,
      notification_url,
      statement_descriptor,
      metadata
    } = requestBody;

    const accessToken = await getAccessToken();
    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 }
    });

    const preference = new Preference(client);

    // Usar back_urls (formato do MP) ou backUrls (formato legado)
    const urls = back_urls || backUrls;

    const body = {
      items: items.map(item => {
        const unitPrice = parseFloat(item.unit_price || item.priceValue);
        if (isNaN(unitPrice) || unitPrice <= 0) {
          throw new Error(`Invalid unit_price for item ${item.id || item.title || 'unknown'}: ${item.unit_price || item.priceValue}`);
        }
        return {
          id: item.id || String(Date.now()),
          title: item.title || item.name || 'Produto',
          quantity: parseInt(item.quantity) || 1,
          unit_price: unitPrice,
          currency_id: item.currency_id || 'BRL',
          description: item.description || item.title || item.name || ''
        };
      }),
      payer: {
        name: payer.name,
        email: payer.email,
        phone: {
          area_code: payer.phone?.area_code || payer.phone?.substring(0, 2) || '',
          number: payer.phone?.number || payer.phone?.substring(2) || ''
        }
      },
      back_urls: {
        success: urls?.success || `${event.headers.origin}/checkout/success`,
        failure: urls?.failure || `${event.headers.origin}/checkout/failure`,
        pending: urls?.pending || `${event.headers.origin}/checkout/pending`
      },
      auto_return: auto_return || 'approved',
      statement_descriptor: statement_descriptor || 'SWEET BAR CHOCOLATES',
      external_reference: external_reference || `order-${Date.now()}`,
      notification_url: notification_url || urls?.webhook,
      payment_methods: {
        installments: 12,
        default_installments: 1,
        excluded_payment_methods: [],
        excluded_payment_types: [
          { id: 'ticket' }, // Boleto bancário
          { id: 'atm' }     // Débito automático
        ]
      },
      metadata: metadata || {},
      expires: false,
      binary_mode: false,
      purpose: 'wallet_purchase' // Força checkout web ao invés de app
    };

    const requestOptions = {
      idempotencyKey: generateIdempotencyKey()
    };

    console.log('Creating Mercado Pago preference:', JSON.stringify(body, null, 2));

    const result = await preference.create({ body, requestOptions });

    console.log('Preference created successfully:', result.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: result.id,
        initPoint: result.init_point,
        sandboxInitPoint: result.sandbox_init_point,
        externalReference: result.external_reference
      })
    };
  } catch (error) {
    console.error('Error creating preference:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        details: error.cause || error.stack
      })
    };
  }
};
