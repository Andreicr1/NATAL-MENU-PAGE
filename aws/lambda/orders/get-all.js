const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

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
    const command = new ScanCommand({
      TableName: process.env.ORDERS_TABLE
    });

    const result = await docClient.send(command);

    // Sort by creation date (newest first)
    const orders = result.Items.sort((a, b) => b.createdAt - a.createdAt);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(orders)
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
