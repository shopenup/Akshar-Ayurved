import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { to, template, data, channel } = req.body;

    if (!to || !template) {
      return res.status(400).json({ message: 'Phone number and template are required' });
    }

    console.log('📱 SMS Request Received:', {
      to,
      template,
      data,
      channel,
      timestamp: new Date().toISOString()
    });

    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate real SMS sending with Twilio-like response
    const messageId = `MSG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('✅ SMS sent successfully:', {
      to,
      template,
      data,
      channel: channel || 'sms',
      messageId,
      timestamp: new Date().toISOString()
    });

    // Return success response (simulating Twilio response)
    res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      sid: messageId,
      to,
      template,
      data,
      status: 'delivered',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ SMS API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send SMS',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
