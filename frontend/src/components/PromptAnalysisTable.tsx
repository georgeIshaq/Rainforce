'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Trash2, 
  Download, 
  BarChart3, 
  Zap,
  Clock,
  Target,
  Loader2
} from 'lucide-react';

interface AnalysisEntry {
  id: string;
  timestamp: Date;
  input: string;
  output: string;
  analysis: string;
  responseTime?: number;
  tokenCount?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  status?: 'success' | 'error' | 'pending';
}

export default function PromptAnalysisTable() {
  const [entries, setEntries] = useState<AnalysisEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Load existing entries from Qdrant on component mount
  useEffect(() => {
    loadAnalysisEntries();
  }, []);

  const loadAnalysisEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analysis/entries');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setEntries(result.data.map((entry: AnalysisEntry & { timestamp: string }) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          })));
        }
      }
    } catch (error) {
      console.error('Error loading analysis entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/analysis/entries/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await loadAnalysisEntries();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'negative': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <div className="w-full">
      {/* Analysis Results Table */}
      <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 border-gray-700/50 shadow-2xl backdrop-blur-sm">
        <CardHeader className="border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              Analysis Data ({entries.length})
            </CardTitle>
            
            <Button
              variant="outline"
              onClick={exportData}
              className="border-gray-600/50 text-gray-300 hover:bg-gray-800/50"
              disabled={entries.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              No analysis data yet. Data will appear here when connected to Qdrant.
            </div>
          ) : (
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700/50 hover:bg-gray-800/30">
                    <TableHead className="text-gray-300">Timestamp</TableHead>
                    <TableHead className="text-gray-300">Input</TableHead>
                    <TableHead className="text-gray-300">Output</TableHead>
                    <TableHead className="text-gray-300">Analysis</TableHead>
                    <TableHead className="text-gray-300">Metrics</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id} className="border-gray-700/50 hover:bg-gray-800/30">
                      <TableCell className="text-gray-300">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          {entry.timestamp.toLocaleString()}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-gray-300 max-w-xs">
                        <div className="truncate" title={entry.input}>
                          {entry.input}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-gray-300 max-w-xs">
                        <div className="truncate" title={entry.output}>
                          {entry.output}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-gray-300 max-w-xs">
                        <div className="truncate" title={entry.analysis}>
                          {entry.analysis}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {entry.sentiment && (
                            <Badge variant="outline" className={getSentimentColor(entry.sentiment)}>
                              {entry.sentiment}
                            </Badge>
                          )}
                          {entry.responseTime && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Zap className="h-3 w-3" />
                              {entry.responseTime}ms
                            </div>
                          )}
                          {entry.tokenCount && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Target className="h-3 w-3" />
                              {entry.tokenCount} tokens
                            </div>
                          )}
                          {entry.status && (
                            <Badge variant="outline" className={getStatusColor(entry.status)}>
                              {entry.status}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEntry(entry.id)}
                          className="h-8 w-8 p-0 hover:bg-red-500/20 text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
