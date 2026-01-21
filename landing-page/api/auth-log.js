// Auth Logging API Endpoint for PM Summit Landing Page
// Captures login events and sends them to Datadog

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      event,
      email,
      name,
      domain,
      success,
      errorMessage,
      timestamp,
      userAgent,
      sessionId
    } = req.body;

    const logEntry = {
      timestamp: timestamp || new Date().toISOString(),
      event: event || 'auth_unknown',
      email: email || 'unknown',
      name: name || 'unknown',
      domain: domain || 'unknown',
      success: success ?? false,
      errorMessage: errorMessage || null,
      sessionId: sessionId || 'anonymous',
      userAgent: userAgent || req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
      source: 'pm-summit-landing-page'
    };

    // Log to console (appears in Vercel Function Logs)
    console.log(JSON.stringify({
      level: success ? 'info' : 'warn',
      message: `[AUTH_EVENT] ${event} - ${email} - ${success ? 'SUCCESS' : 'FAILED'}`,
      ...logEntry
    }));

    // Send directly to Datadog
    const ddApiKey = process.env.DD_API_KEY;
    if (!ddApiKey) {
      console.warn('DD_API_KEY environment variable not set - skipping Datadog log');
    }
    
    const ddResponse = await fetch('https://http-intake.logs.datadoghq.com/api/v2/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': ddApiKey || ''
      },
      body: JSON.stringify([{
        message: `[AUTH_EVENT] ${event}: ${email} - ${success ? 'SUCCESS' : 'FAILED'}${errorMessage ? ' - ' + errorMessage : ''}`,
        service: 'pm-summit-landing-page',
        ddsource: 'vercel-function',
        ddtags: `env:production,event_type:${event},success:${success}`,
        hostname: 'pm-summit.xyz',
        status: success ? 'info' : 'warn',
        ...logEntry
      }])
    });

    if (!ddResponse.ok) {
      console.error('Datadog log failed:', await ddResponse.text());
    } else {
      console.log(`✅ Auth event logged to Datadog: ${event} - ${email}`);
    }

    // Detailed event logging
    switch (event) {
      case 'login_success':
        console.log(`🔐 LOGIN SUCCESS: ${name} (${email}) logged in successfully`);
        break;
      case 'login_failed':
        console.log(`❌ LOGIN FAILED: ${email} - Reason: ${errorMessage}`);
        break;
      case 'login_attempt':
        console.log(`🔄 LOGIN ATTEMPT: User initiated Google Sign-In`);
        break;
      case 'logout':
        console.log(`👋 LOGOUT: ${name} (${email}) logged out`);
        break;
      case 'session_restored':
        console.log(`🔄 SESSION RESTORED: ${name} (${email}) restored from localStorage`);
        break;
      default:
        console.log(`📝 AUTH EVENT: ${event} - ${email}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Auth event logged',
      eventId: `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

  } catch (error) {
    console.error('❌ AUTH_LOGGING_ERROR:', error.message);
    return res.status(500).json({ error: 'Failed to log auth event' });
  }
}
