import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Use the production webhook URL
    const n8nWebhookUrl = 'http://localhost:5678/webhook/7bb6dc45-bc4b-4efe-8512-66aa3352468a';
    
    console.log('Triggering n8n security test webhook:', n8nWebhookUrl);
    
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const responseText = await response.text();
    console.log('n8n security test response:', response.status, responseText);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `n8n webhook failed: ${response.status}`,
          details: responseText,
          hint: response.status === 404 ? 'Make sure the webhook is activated in n8n (not in test mode)' : undefined
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Security test workflow triggered successfully',
      n8nResponse: responseText
    });
  } catch (error) {
    console.error('Error triggering security test:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger security test workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
