const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({});

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.requestContext.http.method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { fileName, fileType } = JSON.parse(event.body);

    const key = `products/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || 'natal-menu-products-images',
      Key: key,
      ContentType: fileType
      // ACL removido - bucket policy garante acesso público
    });

    const bucket = process.env.S3_BUCKET || 'natal-menu-products-images';
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    const fileUrl = `https://${bucket}.s3.amazonaws.com/${key}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ uploadUrl, fileUrl })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
