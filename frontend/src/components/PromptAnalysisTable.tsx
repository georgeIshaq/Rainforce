'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Shield, 
  Download, 
  Search,
  Clock,
  Target,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { useAttackPatterns } from '@/hooks/useAttackPatterns';
import { AttackPattern } from '@/lib/supabaseService';
import { AttackData } from '@/lib/supabase';

export default function PromptAnalysisTable() {
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

  const exportData = () => {
    const dataStr = JSON.stringify(filteredAttacks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attack-patterns-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'instructioninjection':
      case 'instruction_injection':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'prompt_injection':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'jailbreak':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getTechniqueBadgeColor = (technique: string) => {
    switch (technique.toLowerCase()) {
      case 'prompt_injection':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'social_engineering':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default:
        return 'bg-green-500/20 text-green-400 border-green-500/30';
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
    <div className="w-full">
      {/* Attack Patterns Table */}
      <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 border-gray-700/50 shadow-2xl backdrop-blur-sm">
        <CardHeader className="border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              Attack Patterns ({filteredAttacks.length})
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={exportData}
                className="border-gray-600/50 text-gray-300 hover:bg-gray-800/50"
                disabled={filteredAttacks.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
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
                  size="sm"
                >
                  <Search className={`h-4 w-4 ${isSearching ? 'animate-pulse' : ''}`} />
                </Button>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={handleClearSearch}
                    size="sm"
                    className="border-gray-600/50 text-gray-300 hover:bg-gray-800/50"
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
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-between">
              <span className="text-red-400 text-sm">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="h-6 w-6 p-0 text-red-400 hover:bg-red-500/20"
              >
                ×
              </Button>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-red-400" />
            </div>
          ) : filteredAttacks.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              No attack patterns found. Data will appear here when connected to Supabase.
            </div>
          ) : (
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700/50 hover:bg-gray-800/30">
                    <TableHead className="text-gray-300 w-12"></TableHead>
                    <TableHead className="text-gray-300">ID</TableHead>
                    <TableHead className="text-gray-300">Category</TableHead>
                    <TableHead className="text-gray-300">Technique</TableHead>
                    <TableHead className="text-gray-300">Attack Text</TableHead>
                    <TableHead className="text-gray-300">Metrics</TableHead>
                    <TableHead className="text-gray-300">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttacks.map((attack) => {
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
                              <Badge variant="outline" className={getCategoryBadgeColor(attackData.category)}>
                                {attackData.category}
                              </Badge>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            {attackData?.technique_type && (
                              <Badge variant="outline" className={getTechniqueBadgeColor(attackData.technique_type)}>
                                {attackData.technique_type}
                              </Badge>
                            )}
                          </TableCell>
                          
                          <TableCell className="text-gray-300 max-w-xs">
                            <div className="truncate" title={attackData?.attack_text}>
                              {attackData?.attack_text ? 
                                truncateText(attackData.attack_text, 100) : 
                                'No text available'
                              }
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {attackData?.text_length && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <FileText className="h-3 w-3" />
                                  {attackData.text_length} chars
                                </div>
                              )}
                              {(attackData?.vector_size || attack.vector_size) && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Target className="h-3 w-3" />
                                  Vector: {attackData?.vector_size || attack.vector_size}
                                </div>
                              )}
                              {attackData?.attack_number && (
                                <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                                  #{attackData.attack_number}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-gray-300">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              {formatDate(attack.created_at)}
                            </div>
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
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
