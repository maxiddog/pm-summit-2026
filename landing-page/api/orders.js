// Order Collection API Endpoint
// This receives orders from all user swag store instances

const crypto = require('crypto');

// In production, use Vercel KV, Supabase, or similar for persistence
// For demo, we'll log to console and you can use Vercel logs to track orders
// Or integrate with Google Sheets, Airtable, etc.

module.exports = async function handler(req, res) {
  // Enable CORS for swag store instances
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Instance-ID');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const order = req.body;
    const instanceId = req.headers['x-instance-id'] || order.instanceId || 'unknown';

    // Validate required fields
    if (!order.email || !order.items || !order.shippingAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, items, shippingAddress' 
      });
    }

    // Validate shipping address
    const { firstName, lastName, address, city, state, zipCode, country } = order.shippingAddress;
    if (!firstName || !lastName || !address || !city || !zipCode || !country) {
      return res.status(400).json({ 
        error: 'Incomplete shipping address' 
      });
    }

    // Generate order ID
    const orderId = `ORD-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const timestamp = new Date().toISOString();

    // Build the complete order object
    const completeOrder = {
      orderId,
      instanceId,
      email: order.email,
      items: order.items.map(item => ({
        name: item.name,
        size: item.selectedSize || item.size,
        quantity: item.quantity || 1
      })),
      shippingAddress: {
        firstName,
        lastName,
        address,
        apartment: order.shippingAddress.apartment || '',
        city,
        state: state || '',
        zipCode,
        country
      },
      bugsFixed: order.bugsFixed || [],
      submittedAt: timestamp,
      status: 'pending'
    };

    // Log the order (visible in Vercel logs)
    console.log('='.repeat(60));
    console.log('📦 NEW ORDER RECEIVED');
    console.log('='.repeat(60));
    console.log(JSON.stringify(completeOrder, null, 2));
    console.log('='.repeat(60));

    // Optional: Send to external service (Google Sheets, Airtable, webhook, etc.)
    await sendToExternalService(completeOrder);

    return res.status(200).json({
      success: true,
      orderId,
      message: 'Order received! We\'ll ship your swag soon. 🎉'
    });

  } catch (error) {
    console.error('Order submission error:', error);
    return res.status(500).json({ 
      error: 'Failed to process order. Please try again.' 
    });
  }
};

// Send order to external tracking service
async function sendToExternalService(order) {
  // Option 1: Google Sheets via Zapier/Make webhook
  const webhookUrl = process.env.ORDER_WEBHOOK_URL;
  
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...order,
          // Flatten for spreadsheet compatibility
          itemsSummary: order.items.map(i => `${i.name} (${i.size})`).join(', '),
          fullAddress: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}, ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`
        })
      });

      if (!response.ok) {
        console.error('Webhook failed:', await response.text());
      } else {
        console.log('✅ Order sent to webhook successfully');
      }
    } catch (error) {
      console.error('Webhook error:', error);
    }
  }

  // Option 2: Send email notification (if configured)
  const notifyEmail = process.env.ORDER_NOTIFY_EMAIL;
  // Add email sending logic here if needed

  // The order is always logged to console, 
  // so you can view all orders in Vercel's deployment logs
}

