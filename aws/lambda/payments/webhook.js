const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const secretsClient = new SecretsManagerClient({});

let cachedAccessToken = null;

async function getAccessToken() {
  if (cachedAccessToken) return cachedAccessToken;

  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: process.env.SECRET_NAME })
  );

  const secret = JSON.parse(response.SecretString);
  cachedAccessToken = secret.access_token || secret.MERCADOPAGO_ACCESS_TOKEN;
  return cachedAccessToken;
}

exports.handler = async (event) => {
  console.log('Webhook received:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
    const { type, data, action, resource, topic } = body;

    console.log('Webhook type:', type);
    console.log('Webhook action:', action);
    console.log('Webhook data:', data);
    console.log('Webhook resource:', resource);
    console.log('Webhook topic:', topic);

    // Mercado Pago envia em formatos diferentes
    const paymentId = data?.id || resource || event.queryStringParameters?.id || event.queryStringParameters?.['data.id'];

    if (type === 'payment' || action === 'payment.updated' || action === 'payment.created' || topic === 'payment') {
      if (!paymentId) {
        console.warn('No payment ID found in webhook');
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ received: true, warning: 'No payment ID' })
        };
      }

      // Obter informações do pagamento do Mercado Pago
      const accessToken = await getAccessToken();
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!paymentResponse.ok) {
        throw new Error(`Failed to fetch payment: ${paymentResponse.statusText}`);
      }

      const paymentInfo = await paymentResponse.json();
      console.log('Payment info:', JSON.stringify(paymentInfo, null, 2));

      const orderId = paymentInfo.external_reference;
      const status = paymentInfo.status;
      const statusDetail = paymentInfo.status_detail;

      if (!orderId) {
        console.warn('No external_reference found in payment');
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ received: true, warning: 'No external_reference' })
        };
      }

      // Preparar dados de atualização
      const updateData = {
        paymentStatus: status,
        paymentStatusDetail: statusDetail,
        paymentId: paymentId,
        updatedAt: Date.now()
      };

      // Se aprovado, adicionar informações adicionais
      if (status === 'approved') {
        updateData.paymentApprovedAt = Date.now();
        updateData.paymentMethod = paymentInfo.payment_method_id;
        updateData.transactionAmount = paymentInfo.transaction_amount;
      }

      // Atualizar pedido no DynamoDB
      const updateExpression = 'SET ' + Object.keys(updateData)
        .map(key => `${key} = :${key}`)
        .join(', ');

      const expressionAttributeValues = Object.keys(updateData)
        .reduce((acc, key) => {
          acc[`:${key}`] = updateData[key];
          return acc;
        }, {});

      await docClient.send(new UpdateCommand({
        TableName: process.env.ORDERS_TABLE,
        Key: { orderId },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues
      }));

      console.log(`Payment ${paymentId} status: ${status} (${statusDetail}) for order ${orderId}`);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ received: true })
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 200, // Retornar 200 para não reenviar o webhook
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ received: true, error: error.message })
    };
  }
};
