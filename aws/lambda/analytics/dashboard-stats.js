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

  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Get all orders
    const ordersCommand = new ScanCommand({
      TableName: process.env.ORDERS_TABLE
    });
    const ordersResult = await docClient.send(ordersCommand);
    const orders = ordersResult.Items;

    // Calculate statistics
    const now = Date.now();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const yesterdayStart = todayStart - (24 * 60 * 60 * 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Today's stats
    const todayOrders = orders.filter(o =>
      o.createdAt >= todayStart && o.paymentStatus === 'approved'
    );
    const yesterdayOrders = orders.filter(o =>
      o.createdAt >= yesterdayStart && o.createdAt < todayStart && o.paymentStatus === 'approved'
    );

    const ordersToday = todayOrders.length;
    const revenueToday = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const revenueYesterday = yesterdayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Last 30 days stats
    const last30DaysOrders = orders.filter(o =>
      o.createdAt >= thirtyDaysAgo && o.paymentStatus === 'approved'
    );
    const totalRevenue30Days = last30DaysOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgTicket = last30DaysOrders.length > 0 ? totalRevenue30Days / last30DaysOrders.length : 0;

    // Sales by day (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayStart = date.getTime();
      const dayEnd = dayStart + (24 * 60 * 60 * 1000);

      const dayOrders = orders.filter(o =>
        o.createdAt >= dayStart && o.createdAt < dayEnd && o.paymentStatus === 'approved'
      );
      const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      last7Days.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }

    // Revenue by day (last 30 days)
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayStart = date.getTime();
      const dayEnd = dayStart + (24 * 60 * 60 * 1000);

      const dayOrders = orders.filter(o =>
        o.createdAt >= dayStart && o.createdAt < dayEnd && o.paymentStatus === 'approved'
      );
      const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      last30Days.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }

    // Top products
    const productStats = {};
    last30DaysOrders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          if (!productStats[item.id]) {
            productStats[item.id] = {
              id: item.id,
              name: item.name,
              quantity: 0,
              revenue: 0
            };
          }
          productStats[item.id].quantity += item.quantity;
          productStats[item.id].revenue += item.priceValue * item.quantity;
        });
      }
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate changes
    const ordersTodayChange = yesterdayOrders.length > 0
      ? ((ordersToday - yesterdayOrders.length) / yesterdayOrders.length * 100).toFixed(1)
      : ordersToday > 0 ? '+100' : '0';

    const revenueTodayChange = revenueYesterday > 0
      ? ((revenueToday - revenueYesterday) / revenueYesterday * 100).toFixed(1)
      : revenueToday > 0 ? '+100' : '0';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        today: {
          orders: ordersToday,
          revenue: revenueToday,
          ordersChange: ordersTodayChange,
          revenueChange: revenueTodayChange
        },
        last30Days: {
          totalOrders: last30DaysOrders.length,
          totalRevenue: totalRevenue30Days,
          avgTicket: avgTicket
        },
        charts: {
          last7Days,
          last30Days
        },
        topProducts
      })
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
