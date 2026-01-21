// Vercel Serverless Function for logging game events
// Sends logs directly to Datadog AND to console for Vercel logs

const DD_API_KEY = process.env.DD_API_KEY;
const DD_SITE = 'datadoghq.com';

export default async function handler(req, res) {
  // Enable CORS for the frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event, data, timestamp, sessionId, userAgent, page } = req.body;

    // Format the log entry
    const logEntry = {
      timestamp: timestamp || new Date().toISOString(),
      event: event || 'unknown',
      sessionId: sessionId || 'anonymous',
      page: page || '/',
      userAgent: userAgent || req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
      data: data || {}
    };

    // Create Datadog log format
    const ddLog = {
      ddsource: 'vercel-game',
      ddtags: `env:production,service:datadog-game,project:pm-summit-game,event_type:${event}`,
      hostname: 'game.pm-summit.xyz',
      service: 'datadog-game',
      status: 'info',
      message: `[GAME_EVENT] ${event}: ${JSON.stringify(data || {})}`,
      ...logEntry
    };

    // Log to console (for Vercel logs)
    console.log(JSON.stringify({
      level: 'info',
      message: `[GAME_EVENT] ${event}`,
      ...logEntry
    }));

    // Send directly to Datadog Logs API
    try {
      const ddResponse = await fetch(`https://http-intake.logs.${DD_SITE}/api/v2/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': DD_API_KEY
        },
        body: JSON.stringify([ddLog])
      });

      if (!ddResponse.ok) {
        console.error('Datadog API error:', ddResponse.status, await ddResponse.text());
      } else {
        console.log(`✅ Log sent to Datadog: ${event}`);
      }
    } catch (ddError) {
      console.error('Failed to send to Datadog:', ddError.message);
    }

    // For specific event types, add more detailed logging
    switch (event) {
      case 'page_view':
        console.log(`📄 PAGE_VIEW: User viewed ${data?.page || 'game page'}`);
        break;
      case 'game_start':
        console.log(`🎮 GAME_START: User started ${data?.game}`);
        break;
      case 'game_action':
        console.log(`🕹️ GAME_ACTION: ${data?.game} - ${data?.action}`);
        break;
      case 'game_complete':
        console.log(`🏆 GAME_COMPLETE: User completed ${data?.game} - Score: ${data?.score}`);
        break;
      case 'button_click':
        console.log(`🖱️ BUTTON_CLICK: ${data?.button} clicked`);
        break;
      case 'modal_open':
        console.log(`📦 MODAL_OPEN: ${data?.modal} modal opened`);
        break;
      case 'modal_close':
        console.log(`📦 MODAL_CLOSE: ${data?.modal} modal closed`);
        break;
      case 'clue_submit':
        console.log(`🔐 CLUE_SUBMIT: User submitted clues`);
        break;
      case 'click':
        console.log(`🖱️ CLICK: ${data?.element} - ${data?.text?.slice(0, 30)}`);
        break;
      case 'error':
        console.error(`❌ ERROR: ${data?.message}`);
        break;
      default:
        console.log(`📊 EVENT: ${event}`);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Event logged to Datadog',
      eventId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

  } catch (error) {
    console.error('❌ LOGGING_ERROR:', error.message);
    return res.status(500).json({ error: 'Failed to log event' });
  }
}
