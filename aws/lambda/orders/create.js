const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, TransactWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

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
    const { items, customerEmail, customerName, shippingAddress, customerPhone, shippingCost } = JSON.parse(event.body);

    const orderId = `order-${randomUUID()}`;
    const createdAt = Date.now();

    const subtotal = items.reduce((sum, item) => sum + (item.priceValue * item.quantity), 0);
    const total = subtotal + (shippingCost || 0);

    const order = {
      orderId,
      customerEmail,
      customerName,
      customerPhone: customerPhone || null,
      shippingAddress: {
        street: shippingAddress?.street || '',
        complement: shippingAddress?.complement || '',
        neighborhood: shippingAddress?.neighborhood || '',
        city: shippingAddress?.city || '',
        state: shippingAddress?.state || '',
        zipCode: shippingAddress?.zipCode || '',
        ...shippingAddress
      },
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        priceValue: item.priceValue,
        quantity: item.quantity
      })),
      subtotal,
      shippingCost: shippingCost || 0,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: null,
      createdAt,
      updatedAt: createdAt
    };

    // Save order and update inventory in transaction
    const transactItems = [
      {
        Put: {
          TableName: process.env.ORDERS_TABLE,
          Item: order
        }
      }
    ];

    // Add inventory updates
    items.forEach(item => {
      transactItems.push({
        Update: {
          TableName: process.env.INVENTORY_TABLE,
          Key: { productId: item.id },
          UpdateExpression: 'ADD quantity :quantity',
          ExpressionAttributeValues: {
            ':quantity': -item.quantity
          }
        }
      });
    });

    const command = new TransactWriteCommand({
      TransactItems: transactItems
    });

    await docClient.send(command);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ order })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
