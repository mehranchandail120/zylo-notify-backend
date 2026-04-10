export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { playerIds, title, message, data } = req.body;

    if (!playerIds || !playerIds.length) {
      return res.status(400).json({ error: 'playerIds required' });
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_KEY}`
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        include_player_ids: playerIds,
        headings: { en: title || 'Zylo' },
        contents: { en: message || '' },
        data: data || {},
        android_accent_color: 'FF6C63FF',
        small_icon: 'ic_stat_onesignal_default',
        buttons: [
          { id: 'reply',     text: 'Reply',     icon: 'ic_menu_send' },
          { id: 'mark_read', text: 'Mark Read', icon: 'ic_menu_view' }
        ]
      })
    });

    const result = await response.json();

    if (result.errors) {
      return res.status(400).json({ error: result.errors });
    }

    return res.status(200).json({ success: true, id: result.id });

  } catch (err) {
    console.error('Notify error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
