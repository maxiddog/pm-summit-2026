// Admin endpoint to view all orders
// Access this at: /api/admin/orders?token=YOUR_ADMIN_TOKEN

module.exports = async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check admin token
  const adminToken = req.query.token || req.headers['x-admin-token'];
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken) {
    return res.status(500).json({ 
      error: 'ADMIN_TOKEN not configured. Set it in Vercel environment variables.',
      hint: 'Go to Vercel Dashboard → Project Settings → Environment Variables'
    });
  }

  if (adminToken !== expectedToken) {
    return res.status(403).json({ error: 'Unauthorized. Invalid admin token.' });
  }

  // In production, this would query a database
  // For now, return instructions on how to view orders
  return res.status(200).json({
    message: 'Order viewing endpoint',
    instructions: [
      '1. Orders are logged to Vercel deployment logs',
      '2. Run: vercel logs landing-page --output json | grep "NEW ORDER"',
      '3. Or view in Vercel Dashboard → Deployments → Functions → Logs',
      '4. To persist orders, set ORDER_WEBHOOK_URL to a Google Sheets/Airtable webhook'
    ],
    viewLogs: 'https://vercel.com/maxiddogs-projects/landing-page → Functions → Logs',
    tip: 'Set ORDER_WEBHOOK_URL in env vars to auto-send orders to Google Sheets'
  });
};

