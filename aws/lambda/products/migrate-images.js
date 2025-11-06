const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    // Scan all products
    const scanCommand = new ScanCommand({
      TableName: process.env.PRODUCTS_TABLE
    });

    const response = await docClient.send(scanCommand);
    const products = response.Items;

    let updated = 0;
    let skipped = 0;

    // Update products that don't have 'images' field
    for (const product of products) {
      if (!product.images && product.image) {
        const updateCommand = new UpdateCommand({
          TableName: process.env.PRODUCTS_TABLE,
          Key: { id: product.id },
          UpdateExpression: 'SET images = :images',
          ExpressionAttributeValues: {
            ':images': [product.image]
          }
        });

        await docClient.send(updateCommand);
        updated++;
      } else {
        skipped++;
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'Migration completed',
        totalProducts: products.length,
        updated: updated,
        skipped: skipped
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
