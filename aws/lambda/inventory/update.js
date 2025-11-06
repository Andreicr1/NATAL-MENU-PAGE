const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const productId = event.pathParameters.productId;
    const { quantity, operation } = JSON.parse(event.body);
    
    let updateExpression, expressionAttributeValues;
    
    if (operation === 'set') {
      updateExpression = 'SET quantity = :quantity, updatedAt = :updatedAt';
      expressionAttributeValues = {
        ':quantity': quantity,
        ':updatedAt': Date.now()
      };
    } else if (operation === 'increment') {
      updateExpression = 'ADD quantity :quantity SET updatedAt = :updatedAt';
      expressionAttributeValues = {
        ':quantity': quantity,
        ':updatedAt': Date.now()
      };
    } else if (operation === 'decrement') {
      updateExpression = 'ADD quantity :quantity SET updatedAt = :updatedAt';
      expressionAttributeValues = {
        ':quantity': -Math.abs(quantity),
        ':updatedAt': Date.now()
      };
    }
    
    const command = new UpdateCommand({
      TableName: process.env.INVENTORY_TABLE,
      Key: { productId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });
    
    const response = await docClient.send(command);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(response.Attributes)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
