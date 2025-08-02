'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Search, 
  RefreshCw, 
  AlertTriangle,
  Clock,
  Target,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAttackPatterns } from '@/hooks/useAttackPatterns';
import { AttackPattern } from '@/lib/supabaseService';
import { AttackData } from '@/lib/supabase';

interface AttackPatternsTableProps {
  className?: string;
}

export default function AttackPatternsTable({ className }: AttackPatternsTableProps) {
  const { attacks, loading, error, searchAttacks, refreshAttacks, clearError } = useAttackPatterns();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [searchResults, setSearchResults] = useState<AttackPattern[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Get unique categories and techniques for filtering
  const { categories, techniques } = useMemo(() => {
    const cats = new Set<string>();
    const techs = new Set<string>();
    
    attacks.forEach(attack => {
      if (attack.attack_data?.category) cats.add(attack.attack_data.category);
      if (attack.attack_data?.technique_type) techs.add(attack.attack_data.technique_type);
    });

    return {
      categories: Array.from(cats),
      techniques: Array.from(techs)
    };
  }, [attacks]);

  // Filter attacks based on selected filters
  const filteredAttacks = useMemo(() => {
    let result = searchQuery && searchResults.length > 0 ? searchResults : attacks;

    if (selectedCategory) {
      result = result.filter(attack => attack.attack_data?.category === selectedCategory);
    }

    if (selectedTechnique) {
      result = result.filter(attack => attack.attack_data?.technique_type === selectedTechnique);
    }

    return result;
  }, [attacks, searchResults, selectedCategory, selectedTechnique, searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchAttacks(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const toggleRowExpansion = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'instructioninjection':
      case 'instruction_injection':
        return 'bg-red-900/20 text-red-400 border-red-400/20';
      case 'prompt_injection':
        return 'bg-orange-900/20 text-orange-400 border-orange-400/20';
      case 'jailbreak':
        return 'bg-purple-900/20 text-purple-400 border-purple-400/20';
      default:
        return 'bg-blue-900/20 text-blue-400 border-blue-400/20';
    }
  };

  const getTechniqueBadgeColor = (technique: string) => {
    switch (technique.toLowerCase()) {
      case 'prompt_injection':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-400/20';
      case 'social_engineering':
        return 'bg-pink-900/20 text-pink-400 border-pink-400/20';
      default:
        return 'bg-green-900/20 text-green-400 border-green-400/20';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className={`bg-gradient-to-br from-gray-900/95 to-black/95 border-gray-700/50 ${className}`}>
      <CardHeader className="border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg">
              <Shield className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Attack Patterns
              </h2>
              <p className="text-sm text-gray-400">
                {filteredAttacks.length} of {attacks.length} patterns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshAttacks}
              disabled={loading}
              className="h-9 hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search attack patterns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="shrink-0"
              >
                <Search className={`h-4 w-4 ${isSearching ? 'animate-pulse' : ''}`} />
              </Button>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={handleClearSearch}
                  className="shrink-0"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-3 py-1 rounded bg-gray-800 border border-gray-600 text-white text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedTechnique || ''}
              onChange={(e) => setSelectedTechnique(e.target.value || null)}
              className="px-3 py-1 rounded bg-gray-800 border border-gray-600 text-white text-sm"
            >
              <option value="">All Techniques</option>
              {techniques.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-auto h-6 w-6 p-0 text-red-400 hover:bg-red-500/20"
            >
              ×
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700/50 hover:bg-gray-800/50">
                <TableHead className="w-12"></TableHead>
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Category</TableHead>
                <TableHead className="text-gray-300">Technique</TableHead>
                <TableHead className="text-gray-300">Attack Text</TableHead>
                <TableHead className="text-gray-300">Length</TableHead>
                <TableHead className="text-gray-300">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading attack patterns...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredAttacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    No attack patterns found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttacks.map((attack) => {
                  const attackData = attack.attack_data as AttackData;
                  const isExpanded = expandedRows.has(attack.id);
                  
                  return (
                    <>
                      <TableRow 
                        key={attack.id}
                        className="border-gray-700/50 hover:bg-gray-800/30 cursor-pointer"
                        onClick={() => toggleRowExpansion(attack.id)}
                      >
                        <TableCell className="w-12">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-gray-300 font-mono text-sm">
                          {attackData?.attack_id || attack.id}
                        </TableCell>
                        <TableCell>
                          {attackData?.category && (
                            <Badge className={getCategoryBadgeColor(attackData.category)}>
                              {attackData.category}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {attackData?.technique_type && (
                            <Badge className={getTechniqueBadgeColor(attackData.technique_type)}>
                              {attackData.technique_type}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-md">
                          {attackData?.attack_text ? 
                            truncateText(attackData.attack_text, 100) : 
                            'No text available'
                          }
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {attackData?.text_length || 0} chars
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {formatDate(attack.created_at)}
                        </TableCell>
                      </TableRow>
                      
                      {isExpanded && (
                        <TableRow className="border-gray-700/50">
                          <TableCell colSpan={7} className="bg-gray-800/20">
                            <div className="p-4 space-y-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    Attack Number
                                  </h4>
                                  <p className="text-gray-400 text-sm">{attackData?.attack_number || 'N/A'}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    Source
                                  </h4>
                                  <p className="text-gray-400 text-sm">{attackData?.source || 'N/A'}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-300 mb-1">Vector Size</h4>
                                  <p className="text-gray-400 text-sm">{attackData?.vector_size || attack.vector_size || 'N/A'}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Generated At
                                  </h4>
                                  <p className="text-gray-400 text-sm">
                                    {attackData?.generated_at ? formatDate(attackData.generated_at) : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Full Attack Text</h4>
                                <div className="bg-gray-900/50 p-3 rounded border border-gray-600">
                                  <p className="text-gray-300 text-sm whitespace-pre-wrap">
                                    {attackData?.attack_text || 'No attack text available'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
