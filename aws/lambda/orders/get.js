const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const { status, startDate, endDate } = event.queryStringParameters || {};
    
    let command;
    
    if (startDate && endDate) {
      command = new QueryCommand({
        TableName: process.env.ORDERS_TABLE,
        IndexName: 'date-index',
        KeyConditionExpression: 'createdAt BETWEEN :start AND :end',
        ExpressionAttributeValues: {
          ':start': parseInt(startDate),
          ':end': parseInt(endDate)
        }
      });
    } else {
      command = new ScanCommand({
        TableName: process.env.ORDERS_TABLE,
        FilterExpression: status ? 'status = :status' : undefined,
        ExpressionAttributeValues: status ? { ':status': status } : undefined
      });
    }
    
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
