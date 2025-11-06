const { MercadoPagoConfig, Payment } = require('mercadopago');

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

exports.handler = async (event) => {
  try {
    const paymentId = event.pathParameters.paymentId;
    
    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: paymentId });
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        id: paymentInfo.id,
        status: paymentInfo.status,
        statusDetail: paymentInfo.status_detail,
        transactionAmount: paymentInfo.transaction_amount,
        dateApproved: paymentInfo.date_approved,
        externalReference: paymentInfo.external_reference
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
