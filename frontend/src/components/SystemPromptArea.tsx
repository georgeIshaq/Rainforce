'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit3, Check, X, Sparkles, Database, Loader2 } from 'lucide-react';
import { useSystemPrompts } from '@/hooks/useSystemPrompts';

interface SystemPromptAreaProps {
  initialPrompt?: string;
  onPromptSaved?: () => void;
}

export default function SystemPromptArea({ 
  initialPrompt = "You are a helpful AI assistant. You provide clear, accurate, and concise responses to user queries.",
  onPromptSaved
}: SystemPromptAreaProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [qdrantStatus, setQdrantStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  
  const { 
    prompts, 
    loading, 
    error, 
    createPrompt, 
    refreshPrompts 
  } = useSystemPrompts();

  // Check Qdrant connection status
  useEffect(() => {
    const checkQdrantConnection = async () => {
      try {
        const response = await fetch('/api/qdrant/health');
        const result = await response.json();
        setQdrantStatus(result.success ? 'connected' : 'error');
      } catch (err) {
        console.error('Qdrant connection check failed:', err);
        setQdrantStatus('error');
      }
    };

    checkQdrantConnection();
  }, []);

  // Load the most recent prompt on component mount
  useEffect(() => {
    if (prompts.length > 0 && !lastSavedId) {
      const mostRecent = prompts[0];
      setPrompt(mostRecent.content);
      setLastSavedId(mostRecent.id);
    }
  }, [prompts, lastSavedId]);

  const handleSave = async () => {
    // Just exit edit mode without saving to database
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPrompt(initialPrompt);
    setIsEditing(false);
  };

  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    try {
      const savedPrompt = await createPrompt(prompt, `Prompt - ${new Date().toLocaleString()}`);
      if (savedPrompt) {
        console.log('New prompt saved to database:', savedPrompt);
        await refreshPrompts();
        onPromptSaved?.();
      }
    } catch (err) {
      console.error('Error saving to database:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="relative w-1/2 h-80 bg-gradient-to-br from-gray-900/95 to-black/95 border-gray-700/50 shadow-2xl backdrop-blur-sm animate-fade-in animate-glow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              System Prompt
            </h2>
            {/* Qdrant connection status */}
            <div className="flex items-center gap-1">
              <div 
                className={`w-2 h-2 rounded-full ${
                  qdrantStatus === 'connected' ? 'bg-green-400' : 
                  qdrantStatus === 'error' ? 'bg-red-400' : 
                  'bg-yellow-400 animate-pulse'
                }`} 
              />
              <span className="text-xs text-gray-400">
                {qdrantStatus === 'connected' ? 'DB' : 
                 qdrantStatus === 'error' ? 'ERR' : 
                 'CHK'}
              </span>
            </div>
          </div>
        </div>
        
        {!isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-9 w-9 p-0 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200"
              disabled={loading}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveToDatabase}
              className="h-9 w-9 p-0 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all duration-200"
              disabled={isSaving || loading}
              title="Save to database"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="h-9 w-9 p-0 hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-all duration-200"
              title="Accept changes"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-9 w-9 p-0 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
              title="Cancel changes"
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

        {/* Character count and status indicator (when editing) */}
        {isEditing && (
          <div className="absolute bottom-3 right-6 flex items-center gap-3">
            <div className="text-xs text-gray-500 bg-gray-900/80 px-2 py-1 rounded-md backdrop-blur-sm">
              {prompt.length} chars
            </div>
            {error && (
              <div className="text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded-md backdrop-blur-sm">
                Error: {error}
              </div>
            )}
          </div>
        )}

        {/* Database status indicator (when not editing) */}
        {!isEditing && (lastSavedId || prompts.length > 0) && (
          <div className="absolute bottom-3 right-6 text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
            <Database className="h-3 w-3" />
            {lastSavedId ? 'Synced' : `${prompts.length} saved`}
          </div>
        )}

        {/* Gradient overlay for visual appeal */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 pointer-events-none rounded-lg" />
      </CardContent>
    </Card>
  );
}
