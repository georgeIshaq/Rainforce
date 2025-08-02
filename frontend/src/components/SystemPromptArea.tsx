'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit3, Check, X, Sparkles } from 'lucide-react';

interface SystemPromptAreaProps {
  initialPrompt?: string;
}

export default function SystemPromptArea({ 
  initialPrompt = "You are a helpful AI assistant. You provide clear, accurate, and concise responses to user queries."
}: SystemPromptAreaProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState(initialPrompt);

  const handleSave = () => {
    setIsEditing(false);
    // Handle the prompt change internally
    console.log('System prompt updated:', prompt);
    // You could add localStorage, API calls, or other side effects here
  };

  const handleCancel = () => {
    setPrompt(initialPrompt);
    setIsEditing(false);
  };

  return (
    <Card className="relative w-1/2 h-80 bg-gradient-to-br from-gray-900/95 to-black/95 border-gray-700/50 shadow-2xl backdrop-blur-sm animate-fade-in animate-glow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            System Prompt
          </h2>
        </div>
        
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-9 w-9 p-0 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="h-9 w-9 p-0 hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-all duration-200"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-9 w-9 p-0 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 h-full">
        <div className="p-6 h-full">
          {isEditing ? (
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-full resize-none border-none bg-transparent text-gray-100 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-relaxed"
              placeholder="Enter your system prompt here..."
              autoFocus
            />
          ) : (
            <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {prompt}
              </p>
            </div>
          )}
        </div>

        {/* Character count indicator (when editing) */}
        {isEditing && (
          <div className="absolute bottom-3 right-6 text-xs text-gray-500 bg-gray-900/80 px-2 py-1 rounded-md backdrop-blur-sm">
            {prompt.length} chars
          </div>
        )}

        {/* Gradient overlay for visual appeal */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 pointer-events-none rounded-lg" />
      </CardContent>
    </Card>
  );
}
