// Vercel Log Drain Proxy for Datadog
// This endpoint receives logs from Vercel and forwards them to Datadog

export const config = {
  api: {
    bodyParser: false, // Handle raw body
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read the raw body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString('utf8');
    
    // Parse Vercel's log format (NDJSON - newline delimited JSON)
    const logs = body
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          const parsed = JSON.parse(line);
          return {
            message: parsed.message || JSON.stringify(parsed),
            ddsource: 'vercel',
            ddtags: `env:production,service:datadog-game,project:pm-summit`,
            hostname: 'game.pm-summit.xyz',
            service: 'datadog-game',
            status: parsed.level || 'info',
            timestamp: parsed.timestamp || new Date().toISOString(),
            ...parsed
          };
        } catch (e) {
          return {
            message: line,
            ddsource: 'vercel',
            service: 'datadog-game',
            status: 'info'
          };
        }
      });

    // Forward to Datadog
    const ddResponse = await fetch('https://http-intake.logs.datadoghq.com/api/v2/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': process.env.DD_API_KEY
      },
      body: JSON.stringify(logs)
    });

    if (!ddResponse.ok) {
      console.error('Datadog error:', await ddResponse.text());
      return res.status(500).json({ error: 'Failed to forward to Datadog' });
    }

    console.log(`✅ Forwarded ${logs.length} logs to Datadog`);
    return res.status(200).json({ success: true, count: logs.length });

  } catch (error) {
    console.error('Drain error:', error);
    return res.status(500).json({ error: error.message });
  }
}
