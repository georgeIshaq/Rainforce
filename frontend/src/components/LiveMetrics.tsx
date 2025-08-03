'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Clock, 
  Zap
} from 'lucide-react';

import { AgentResponse } from '@/lib/supabaseService';

interface LiveMetricsProps {
  responses: AgentResponse[];
}

export default function LiveMetrics({ responses }: LiveMetricsProps) {
  const [metrics, setMetrics] = useState({
    totalTests: 0,
    withEvaluation: 0,
    withRecommendation: 0,
    passFailRate: 0,
    recentActivity: [] as AgentResponse[]
  });

  useEffect(() => {
    if (!responses.length) return;

    const withEvaluation = responses.filter(r => r.evaluation).length;
    const withRecommendation = responses.filter(r => r.recommendation).length;
    
    // Simple pass/fail based on whether there's an evaluation
    const passFailRate = responses.length > 0 ? Math.round((withEvaluation / responses.length) * 100) : 0;

    // Get recent activity (last 5 responses)
    const recentActivity = responses
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 5);

    setMetrics({
      totalTests: responses.length,
      withEvaluation,
      withRecommendation,
      passFailRate,
      recentActivity
    });
  }, [responses]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Test Results */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Test Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Tests</p>
              <p className="text-2xl font-bold text-white">{metrics.totalTests}</p>
            </div>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              {metrics.totalTests} runs
            </Badge>
          </div>
          
          <div className="border-t border-gray-700 pt-3">
            <p className="text-sm text-gray-400 mb-2">Pass/Fail Rate</p>
            <p className="text-lg font-semibold text-white">{metrics.passFailRate}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Coverage */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">With Evaluation</p>
            <p className="text-2xl font-bold text-white">{metrics.withEvaluation}</p>
            <Badge 
              variant="secondary" 
              className="bg-green-500/20 text-green-400"
            >
              {Math.round((metrics.withEvaluation / metrics.totalTests) * 100) || 0}%
            </Badge>
          </div>
          
          <div className="border-t border-gray-700 pt-3">
            <p className="text-sm text-gray-400 mb-2">With Recommendations</p>
            <p className="text-sm text-white font-medium">{metrics.withRecommendation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Recent Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-32 overflow-y-auto">
            {metrics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 truncate">
                    Test #{activity.id}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {activity.evaluation || 'Pending'}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs border-gray-600 ${
                    activity.recommendation ? 'text-green-400' : 'text-gray-400'
                  }`}
                >
                  {activity.recommendation ? 'REC' : 'EVAL'}
                </Badge>
              </div>
            ))}
            {metrics.recentActivity.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No tests yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
