const { MercadoPagoConfig, Payment } = require('mercadopago');
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
      transaction_amount,
      description,
      payer,
      external_reference,
      notification_url
    } = requestBody;

    // Validar campos obrigatórios
    if (!transaction_amount || !payer || !payer.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields: transaction_amount, payer.email'
        })
      };
    }

    const accessToken = await getAccessToken();
    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 }
    });

    const payment = new Payment(client);

    const body = {
      transaction_amount: parseFloat(transaction_amount),
      description: description || 'Compra Sweet Bar Chocolates',
      payment_method_id: 'pix',
      payer: {
        email: payer.email,
        first_name: payer.first_name || payer.name?.split(' ')[0] || 'Cliente',
        last_name: payer.last_name || payer.name?.split(' ').slice(1).join(' ') || 'Sweet Bar',
        identification: payer.identification || {
          type: 'CPF',
          number: '00000000000' // Será substituído pelos dados reais
        }
      },
      notification_url: notification_url,
      external_reference: external_reference
    };

    const requestOptions = {
      idempotencyKey: generateIdempotencyKey()
    };

    console.log('Creating PIX payment:', JSON.stringify(body, null, 2));

    const result = await payment.create({ body, requestOptions });

    console.log('PIX payment created successfully:', result.id);

    // Extrair dados do PIX da resposta
    const pixData = {
      id: result.id,
      status: result.status,
      status_detail: result.status_detail,
      qr_code: result.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: result.point_of_interaction?.transaction_data?.ticket_url,
      external_reference: result.external_reference
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(pixData)
    };
  } catch (error) {
    console.error('Error creating PIX payment:', error);
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
