import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, userInput } = await request.json();

    if (!systemPrompt || !userInput) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For demo purposes, create a mock response
    // In production, replace this with actual AI API call (OpenAI, Anthropic, etc.)
    const mockResponses = [
      "That's an interesting perspective. Let me think about this...",
      "Based on the system prompt, I would approach this by considering multiple factors.",
      "This is a complex question that requires careful analysis.",
      "I understand your request. Here's my thoughtful response:",
      "Let me break this down step by step for you.",
    ];

    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    const enhancedResponse = `${randomResponse}\n\nSystem Context: ${systemPrompt.substring(0, 100)}...\n\nUser Query: "${userInput}"\n\nDetailed Response: This is a simulated AI response for testing purposes. In a production environment, this would be replaced with actual AI model responses from services like OpenAI, Anthropic, or other AI providers.`;

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return NextResponse.json({
      success: true,
      output: enhancedResponse,
      tokenCount: Math.floor(enhancedResponse.length / 4), // Rough token estimate
      model: 'mock-ai-v1',
      usage: {
        prompt_tokens: Math.floor(systemPrompt.length / 4) + Math.floor(userInput.length / 4),
        completion_tokens: Math.floor(enhancedResponse.length / 4),
        total_tokens: Math.floor((systemPrompt.length + userInput.length + enhancedResponse.length) / 4)
      }
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
