'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronRight, Clock, MessageSquare, Target, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAgentResponses } from '@/hooks/useAgentResponses';

const AgentResponsesTable: React.FC = () => {
  const { responses, loading, error, searchResponses, filterByEvaluation, clearSearch } = useAgentResponses();
  const [searchTerm, setSearchTerm] = useState('');
  const [evaluationFilter, setEvaluationFilter] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Get unique evaluations for filter
  const uniqueEvaluations = useMemo(() => {
    const evaluations = responses
      .map(response => response.evaluation)
      .filter((evaluation): evaluation is string => evaluation !== null && evaluation !== '')
      .filter((evaluation, index, array) => array.indexOf(evaluation) === index);
    return evaluations.sort();
  }, [responses]);

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      await searchResponses(value);
    } else {
      await clearSearch();
    }
  };

  const handleEvaluationFilter = async (evaluation: string) => {
    setEvaluationFilter(evaluation);
    if (evaluation) {
      await filterByEvaluation(evaluation);
    } else {
      await clearSearch();
    }
    setSearchTerm(''); // Clear search when filtering
  };

  const toggleRowExpansion = (responseId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(responseId)) {
      newExpanded.delete(responseId);
    } else {
      newExpanded.add(responseId);
    }
    setExpandedRows(newExpanded);
  };

  const getEvaluationBadge = (evaluation: string | null) => {
    if (!evaluation) {
      return <Badge variant="secondary">No Evaluation</Badge>;
    }

    const lowerEval = evaluation.toLowerCase();
    
    if (lowerEval.includes('success') || lowerEval.includes('pass') || lowerEval.includes('good')) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        <CheckCircle className="w-3 h-3 mr-1" />
        {evaluation}
      </Badge>;
    }
    
    if (lowerEval.includes('fail') || lowerEval.includes('error') || lowerEval.includes('bad')) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        <XCircle className="w-3 h-3 mr-1" />
        {evaluation}
      </Badge>;
    }
    
    if (lowerEval.includes('warning') || lowerEval.includes('partial')) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
        <AlertCircle className="w-3 h-3 mr-1" />
        {evaluation}
      </Badge>;
    }

    return <Badge variant="outline">{evaluation}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Agent Responses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-400">Loading agent responses...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Agent Responses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-400 text-center py-8">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          Agent Responses
          <Badge variant="secondary" className="ml-auto">
            {responses.length} {responses.length === 1 ? 'response' : 'responses'}
          </Badge>
        </CardTitle>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search agent responses..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={evaluationFilter}
                onChange={(e) => handleEvaluationFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm appearance-none cursor-pointer"
              >
                <option value="">All Evaluations</option>
                {uniqueEvaluations.map((evaluation) => (
                  <option key={evaluation} value={evaluation}>
                    {evaluation}
                  </option>
                ))}
              </select>
            </div>
            
            {(searchTerm || evaluationFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setEvaluationFilter('');
                  clearSearch();
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {responses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No agent responses found.
          </div>
        ) : (
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-gray-300 w-12"></TableHead>
                  <TableHead className="text-gray-300">Attack</TableHead>
                  <TableHead className="text-gray-300">Agent Response</TableHead>
                  <TableHead className="text-gray-300">Evaluation</TableHead>
                  <TableHead className="text-gray-300">Recommendation</TableHead>
                  <TableHead className="text-gray-300">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <React.Fragment key={response.id}>
                    <TableRow 
                      className="border-gray-700 hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => toggleRowExpansion(response.id)}
                    >
                      <TableCell className="text-gray-300">
                        {expandedRows.has(response.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-red-400" />
                          <span className="font-mono text-sm">
                            {truncateText(response.attack, 50)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <span className="text-sm">
                          {truncateText(response.agent_response, 80)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getEvaluationBadge(response.evaluation)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <span className="text-sm">
                          {response.recommendation ? truncateText(response.recommendation, 60) : 'No recommendation'}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(response.created_at)}
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Row Content */}
                    {expandedRows.has(response.id) && (
                      <TableRow className="border-gray-700">
                        <TableCell colSpan={6} className="bg-gray-800/30">
                          <div className="space-y-4 p-4">
                            {/* Agent Prompt */}
                            {response.agent_prompt && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-blue-400" />
                                  Agent Prompt
                                </h4>
                                <div className="bg-gray-900 border border-gray-600 rounded-lg p-3">
                                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                                    {response.agent_prompt}
                                  </pre>
                                </div>
                              </div>
                            )}
                            
                            {/* Full Attack */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                <Target className="w-4 h-4 text-red-400" />
                                Attack Vector
                              </h4>
                              <div className="bg-gray-900 border border-gray-600 rounded-lg p-3">
                                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                                  {response.attack}
                                </pre>
                              </div>
                            </div>
                            
                            {/* Full Agent Response */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-green-400" />
                                Agent Response
                              </h4>
                              <div className="bg-gray-900 border border-gray-600 rounded-lg p-3">
                                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                                  {response.agent_response}
                                </pre>
                              </div>
                            </div>
                            
                            {/* Recommendation */}
                            {response.recommendation && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-purple-400" />
                                  Recommendation
                                </h4>
                                <div className="bg-gray-900 border border-gray-600 rounded-lg p-3">
                                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                                    {response.recommendation}
                                  </pre>
                                </div>
                              </div>
                            )}
                            
                            {/* Metadata */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
                              <div>
                                <span className="text-xs text-gray-500">Response ID</span>
                                <p className="text-sm text-gray-300 font-mono">#{response.id}</p>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">Evaluation</span>
                                <div className="mt-1">
                                  {getEvaluationBadge(response.evaluation)}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">Has Recommendation</span>
                                <p className="text-sm text-gray-300">
                                  {response.recommendation ? 'Yes' : 'No'}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">Created At</span>
                                <p className="text-sm text-gray-300">{formatDate(response.created_at)}</p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentResponsesTable;
