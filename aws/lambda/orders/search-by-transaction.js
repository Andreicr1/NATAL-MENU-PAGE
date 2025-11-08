const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };

  if (event.requestContext.http.method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Obter o termo de busca dos query parameters
    const searchTerm = event.queryStringParameters?.q || event.queryStringParameters?.transactionId || '';

    if (!searchTerm || searchTerm.length < 3) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Termo de busca inválido. Forneça pelo menos 3 caracteres.'
        })
      };
    }

    console.log(`Buscando pedidos com termo: ${searchTerm}`);

    // Buscar em toda a tabela (scan com filtro)
    // Em produção, seria melhor usar um GSI (Global Secondary Index)
    const params = {
      TableName: process.env.ORDERS_TABLE,
      FilterExpression: `
        contains(#transactionId, :searchTerm) OR
        contains(#paymentId, :searchTerm) OR
        contains(#orderId, :searchTerm) OR
        contains(#orderNumber, :searchTerm) OR
        contains(#externalReference, :searchTerm)
      `,
      ExpressionAttributeNames: {
        '#transactionId': 'transactionId',
        '#paymentId': 'paymentId',
        '#orderId': 'orderId',
        '#orderNumber': 'orderNumber',
        '#externalReference': 'externalReference'
      },
      ExpressionAttributeValues: {
        ':searchTerm': searchTerm
      }
    };

    const command = new ScanCommand(params);
    const response = await docClient.send(command);

    // Ordenar por data de criação (mais recentes primeiro)
    const orders = response.Items.sort((a, b) => b.createdAt - a.createdAt);

    console.log(`Encontrados ${orders.length} pedidos`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        count: orders.length,
        searchTerm,
        orders
      })
    };
  } catch (error) {
    console.error('Erro na busca:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Erro ao buscar pedidos',
        error: error.message
      })
    };
  }
};
