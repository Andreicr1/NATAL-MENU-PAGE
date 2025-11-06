const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const categoryId = event.pathParameters?.categoryId;
    
    if (categoryId) {
      const command = new QueryCommand({
        TableName: process.env.PRODUCTS_TABLE,
        IndexName: 'category-index',
        KeyConditionExpression: 'categoryId = :categoryId',
        ExpressionAttributeValues: {
          ':categoryId': categoryId
        }
      });
      
      const response = await docClient.send(command);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(response.Items)
      };
    }
    
    const command = new ScanCommand({
      TableName: process.env.PRODUCTS_TABLE
    });
    
    const response = await docClient.send(command);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(response.Items)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
