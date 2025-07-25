export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, messages } = req.body;
    
    let userMessage = '';
    if (typeof message === 'string') {
      userMessage = message;
    } else if (message && message.content) {
      userMessage = message.content;
    } else if (messages && messages.length > 0) {
      userMessage = messages[messages.length - 1].content;
    } else {
      userMessage = 'Hello';
    }
    
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    
    res.status(200).json({
      message: claudeData.content[0].text,
      endCall: false
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Sorry, I encountered an error. Please try again.',
      endCall: false
    });
  }
}
