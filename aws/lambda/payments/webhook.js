const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const secretsClient = new SecretsManagerClient({});
const lambdaClient = new LambdaClient({});

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
  console.log('[WEBHOOK] ========== WEBHOOK RECEIVED ==========');
  console.log('[WEBHOOK] Full event:', JSON.stringify(event, null, 2));
  console.log('[WEBHOOK] Headers:', JSON.stringify(event.headers, null, 2));
  console.log('[WEBHOOK] Query params:', JSON.stringify(event.queryStringParameters, null, 2));

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    console.log('[WEBHOOK] Parsed body:', JSON.stringify(body, null, 2));
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
      console.log('[WEBHOOK] ========== PAYMENT INFO ==========');
      console.log('[WEBHOOK] Payment ID:', paymentId);
      console.log('[WEBHOOK] Status:', paymentInfo.status);
      console.log('[WEBHOOK] External Reference (orderId):', paymentInfo.external_reference);
      console.log('[WEBHOOK] Full payment info:', JSON.stringify(paymentInfo, null, 2));

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
        transactionId: String(paymentId), // ID da transação do Mercado Pago
        externalReference: orderId,
        updatedAt: Date.now()
      };

      // Se aprovado, adicionar informações adicionais
      if (status === 'approved') {
        updateData.paymentApprovedAt = Date.now();
        updateData.paymentMethod = paymentInfo.payment_method_id;
        updateData.transactionAmount = paymentInfo.transaction_amount;
        updateData.status = 'confirmed'; // Atualizar status do pedido
      }

      // Atualizar pedido no DynamoDB (preservando dados existentes)
      const updateExpression = 'SET ' + Object.keys(updateData)
        .map(key => `#${key} = :${key}`)
        .join(', ');

      const expressionAttributeNames = Object.keys(updateData)
        .reduce((acc, key) => {
          acc[`#${key}`] = key;
          return acc;
        }, {});

      const expressionAttributeValues = Object.keys(updateData)
        .reduce((acc, key) => {
          acc[`:${key}`] = updateData[key];
          return acc;
        }, {});

      await docClient.send(new UpdateCommand({
        TableName: process.env.ORDERS_TABLE,
        Key: { orderId },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      }));

      console.log(`[WEBHOOK] ========== ORDER UPDATED ==========`);
      console.log(`[WEBHOOK] Payment ${paymentId} status: ${status} (${statusDetail}) for order ${orderId}`);
      console.log(`[WEBHOOK] Update data:`, JSON.stringify(updateData, null, 2));

      // [ENTERPRISE] Trigger confirmation notifications if approved
      if (status === 'approved') {
        console.log('[WEBHOOK] ========== PAYMENT APPROVED ==========');
        console.log('[WEBHOOK] Triggering confirmation notification...');
        await triggerConfirmationNotification(orderId);
        console.log('[WEBHOOK] Notification triggered successfully');
      } else {
        console.log(`[WEBHOOK] Payment not approved yet. Status: ${status}`);
      }
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

/**
 * Trigger confirmation notification Lambda (async)
 * Enterprise pattern: Fire-and-forget with error handling
 */
async function triggerConfirmationNotification(orderId) {
  try {
    const functionName = process.env.SEND_CONFIRMATION_FUNCTION;

    if (!functionName) {
      console.warn('[WEBHOOK] SEND_CONFIRMATION_FUNCTION not configured, skipping notifications');
      return;
    }

    console.log('[WEBHOOK] Triggering confirmation notification for order:', orderId);

    const command = new InvokeCommand({
      FunctionName: functionName,
      InvocationType: 'Event', // Async invocation (fire-and-forget)
      Payload: JSON.stringify({ orderId })
    });

    await lambdaClient.send(command);
    console.log('[WEBHOOK] Notification triggered successfully');
  } catch (error) {
    // Log error but don't fail webhook
    console.error('[WEBHOOK] Failed to trigger notification:', error.message);
    console.error('[WEBHOOK] Error details:', error);
    // Webhook continues successfully even if notification fails
  }
}
