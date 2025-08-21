import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Use the production webhook URL (remove -test from the URL)
    const n8nWebhookUrl = 'http://localhost:5678/webhook/f48cd88c-7950-4cbe-9db7-7531947246c1';
    
    console.log('Triggering n8n webhook:', n8nWebhookUrl);
    
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Empty body since your workflow doesn't need input
    });

    const responseText = await response.text();
    console.log('n8n response:', response.status, responseText);

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
      message: 'Attack generation workflow triggered successfully',
      n8nResponse: responseText
    });
  } catch (error) {
    console.error('Error triggering attack generation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger attack generation workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
