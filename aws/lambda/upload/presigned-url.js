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

    console.log('Gerando presigned URL para:', { fileName, fileType });

    const key = `products/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const bucket = process.env.S3_BUCKET || 'natal-menu-products-images';

    console.log('Bucket:', bucket, 'Key:', key);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType
      // ACL removido - bucket policy garante acesso público
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // URL do arquivo - usar formato com região explícita
    const region = process.env.AWS_REGION || 'us-east-1';
    const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    console.log('Presigned URL gerada com sucesso');
    console.log('Upload URL:', uploadUrl);
    console.log('File URL:', fileUrl);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ uploadUrl, fileUrl })
    };
  } catch (error) {
    console.error('Erro ao gerar presigned URL:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack
      })
    };
  }
};
