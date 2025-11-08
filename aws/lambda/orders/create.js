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
    const requestBody = JSON.parse(event.body);
    console.log('[CREATE_ORDER] Request body:', JSON.stringify(requestBody, null, 2));
    
    const { items, customerEmail, customerName, shippingAddress, customerPhone, shippingCost, transactionId, externalReference, deliveryType, scheduledDate } = requestBody;

    // Validação de dados obrigatórios
    if (!items || items.length === 0) {
      throw new Error('Items are required');
    }
    if (!customerEmail) {
      throw new Error('Customer email is required');
    }
    if (!customerName) {
      throw new Error('Customer name is required');
    }

    const createdAt = Date.now();
    const orderNumber = `SB${Date.now().toString().slice(-8)}`; // SB + 8 dígitos
    const orderId = `order-${randomUUID()}`; // UUID completo para sistema

    const subtotal = items.reduce((sum, item) => sum + (item.priceValue * item.quantity), 0);
    const total = subtotal + (shippingCost || 0);

    console.log('[CREATE_ORDER] Creating order:', { orderId, orderNumber, customerEmail, customerName, total });

    const order = {
      orderId,
      orderNumber, // Número amigável para cliente
      customerEmail,
      customerName,
      customerPhone: customerPhone || null,
      shippingAddress: {
        street: shippingAddress?.street || '',
        number: shippingAddress?.number || '',
        complement: shippingAddress?.complement || '',
        neighborhood: shippingAddress?.neighborhood || '',
        city: shippingAddress?.city || '',
        state: shippingAddress?.state || '',
        zipCode: shippingAddress?.zipCode || ''
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
      transactionId: transactionId || null, // ID da transação do Mercado Pago
      externalReference: externalReference || orderId, // Referência externa
      deliveryType: deliveryType || 'express', // Tipo de entrega
      scheduledDate: scheduledDate || null, // Data programada (se aplicável)
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

    console.log('[CREATE_ORDER] Order created successfully:', { 
      orderId, 
      orderNumber,
      customerEmail: order.customerEmail,
      itemsCount: order.items.length,
      total: order.total
    });

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
