const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.requestContext.http.method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const orderId = event.pathParameters?.orderId;

    if (!orderId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Order ID is required' })
      };
    }

    const command = new GetCommand({
      TableName: process.env.ORDERS_TABLE,
      Key: { orderId }
    });

    const result = await docClient.send(command);

    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Order not found' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        orderId: result.Item.orderId,
        customerName: result.Item.customerName,
        customerEmail: result.Item.customerEmail,
        customerPhone: result.Item.customerPhone,
        customerCPF: result.Item.customerCPF,
        shippingAddress: result.Item.shippingAddress,
        items: result.Item.items,
        subtotal: result.Item.subtotal,
        shippingCost: result.Item.shippingCost,
        total: result.Item.total,
        status: result.Item.status,
        paymentStatus: result.Item.paymentStatus,
        paymentStatusDetail: result.Item.paymentStatusDetail,
        paymentId: result.Item.paymentId,
        paymentMethod: result.Item.paymentMethod,
        transactionAmount: result.Item.transactionAmount,
        createdAt: result.Item.createdAt,
        updatedAt: result.Item.updatedAt,
        paymentApprovedAt: result.Item.paymentApprovedAt
      })
    };
  } catch (error) {
    console.error('Error fetching order status:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
