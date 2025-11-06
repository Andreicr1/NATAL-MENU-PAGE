const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

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
    const productId = event.pathParameters.id;

    const command = new DeleteCommand({
      TableName: process.env.PRODUCTS_TABLE,
      Key: { id: productId }
    });

    await docClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Product deleted successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
