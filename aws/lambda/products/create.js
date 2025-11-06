const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const product = JSON.parse(event.body);

    const item = {
      id: product.id || randomUUID(),
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      price: product.price,
      priceValue: product.priceValue,
      image: product.image,
      images: product.images || [product.image].filter(Boolean), // Suporte para múltiplas imagens
      weight: product.weight,
      ingredients: product.ingredients || [],
      tags: product.tags || [],
      deliveryOptions: product.deliveryOptions || [],
      featured: product.featured || false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const command = new PutCommand({
      TableName: process.env.PRODUCTS_TABLE,
      Item: item
    });

    await docClient.send(command);

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(item)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
