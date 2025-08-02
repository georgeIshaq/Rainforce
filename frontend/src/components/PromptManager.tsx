'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Search, Loader2 } from 'lucide-react';
import { useSystemPrompts, SystemPrompt } from '@/hooks/useSystemPrompts';
import { Input } from '@/components/ui/input';

interface PromptManagerProps {
  onSelectPrompt?: (content: string) => void;
}

export default function PromptManager({ onSelectPrompt }: PromptManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SystemPrompt[]>([]);
  
  const { 
    prompts, 
    loading, 
    error, 
    deletePrompt,
    searchPrompts,
    refreshPrompts 
  } = useSystemPrompts();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchPrompts(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deletePrompt(id);
    if (success) {
      await refreshPrompts();
      // Clear search results if the deleted item was in search results
      setSearchResults(prev => prev.filter(p => p.id !== id));
    }
  };

  const displayPrompts = searchResults.length > 0 ? searchResults : prompts;

  return (
    <Card className="w-1/2 h-80 bg-gradient-to-br from-gray-900/95 to-black/95 border-gray-700/50 shadow-2xl backdrop-blur-sm animate-fade-in">
      <CardHeader className="pb-3 border-b border-gray-700/50">
        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
            <Search className="h-5 w-5 text-blue-400" />
          </div>
          Saved Prompts ({prompts.length})
        </CardTitle>
        
        {/* Search Bar */}
        <div className="flex gap-2">
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch()}
            className="bg-transparent border-gray-600/50 text-gray-100 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-purple-400/50"
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            size="sm"
            className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500/80 hover:to-purple-500/80 border-none"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative h-48 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-400 bg-red-500/10 mx-4 my-2 rounded-lg border border-red-500/20">
            Error: {error}
          </div>
        ) : displayPrompts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            {searchQuery ? 'No prompts found' : 'No saved prompts yet'}
          </div>
        ) : (
          <ScrollArea className="h-full w-full">
            <div className="space-y-3 p-4">
              {displayPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-600/30 rounded-lg p-3 hover:from-gray-700/50 hover:to-gray-800/50 hover:border-gray-500/50 transition-all duration-200 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-100 truncate">
                      {prompt.title || 'Untitled Prompt'}
                    </h4>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSelectPrompt?.(prompt.content)}
                        className="h-6 w-6 p-0 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all duration-200"
                        title="Use this prompt"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(prompt.id)}
                        className="h-6 w-6 p-0 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
                        title="Delete prompt"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-300 line-clamp-2 mb-2 leading-relaxed">
                    {prompt.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {prompt.tags?.map((tag: string) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-purple-500/30"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(prompt.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {/* Gradient overlay for visual appeal */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none rounded-b-lg" />
      </CardContent>
    </Card>
  );
}
