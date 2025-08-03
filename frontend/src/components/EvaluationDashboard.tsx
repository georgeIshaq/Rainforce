'use client';

import { useMemo } from 'react';
import { useAgentResponses } from '@/hooks/useAgentResponses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardHeader from '@/components/DashboardHeader';
import LiveMetrics from '@/components/LiveMetrics';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function EvaluationDashboard() {
  const { responses, loading, refetch } = useAgentResponses();

  const dashboardData = useMemo(() => {
    if (!responses.length) return null;

    // Evaluation distribution
    const evaluationCounts = responses.reduce((acc, response) => {
      const evaluation = response.evaluation || 'Unknown';
      acc[evaluation] = (acc[evaluation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const evaluationData = Object.entries(evaluationCounts).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / responses.length) * 100)
    }));

    // Recommendation status
    const recommendationCounts = responses.reduce((acc, response) => {
      const hasRec = response.recommendation ? 'Has Recommendation' : 'No Recommendation';
      acc[hasRec] = (acc[hasRec] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recommendationData = Object.entries(recommendationCounts).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / responses.length) * 100)
    }));

    // Response length analysis
    const responseLengths = responses.map(r => ({
      id: r.id,
      responseLength: r.agent_response.length,
      attackLength: r.attack.length,
      evaluation: r.evaluation || 'Unknown'
    }));

    return {
      evaluationData,
      recommendationData,
      responseLengths,
      totalResponses: responses.length,
      avgResponseLength: Math.round(responses.reduce((sum, r) => sum + r.agent_response.length, 0) / responses.length),
      avgAttackLength: Math.round(responses.reduce((sum, r) => sum + r.attack.length, 0) / responses.length),
      recommendationRate: Math.round((responses.filter(r => r.recommendation).length / responses.length) * 100)
    };
  }, [responses]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No data available for dashboard</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <DashboardHeader 
        totalResponses={dashboardData.totalResponses}
        recommendationRate={dashboardData.recommendationRate}
        onRefresh={refetch}
      />

      {/* Live Metrics */}
      <LiveMetrics responses={responses} />

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-600/50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-purple-200 text-sm font-medium">Avg Response Length</p>
              <p className="text-2xl font-bold text-white">{dashboardData.avgResponseLength}</p>
              <p className="text-purple-300 text-xs">characters</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/50 border-cyan-600/50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-cyan-200 text-sm font-medium">Avg Attack Length</p>
              <p className="text-2xl font-bold text-white">{dashboardData.avgAttackLength}</p>
              <p className="text-cyan-300 text-xs">characters</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 border-emerald-600/50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-emerald-200 text-sm font-medium">Evaluation Types</p>
              <p className="text-2xl font-bold text-white">{dashboardData.evaluationData.length}</p>
              <p className="text-emerald-300 text-xs">unique types</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/50 to-amber-800/50 border-amber-600/50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-amber-200 text-sm font-medium">Latest Tests</p>
              <p className="text-2xl font-bold text-white">
                {dashboardData.totalResponses}
              </p>
              <p className="text-amber-300 text-xs">total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evaluation Distribution */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Evaluation Distribution</CardTitle>
            <CardDescription className="text-gray-400">
              Breakdown of response evaluations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.evaluationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.evaluationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recommendation Status */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recommendation Coverage</CardTitle>
            <CardDescription className="text-gray-400">
              Responses with vs without recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.recommendationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Response Length Analysis */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Response vs Attack Length Correlation</CardTitle>
          <CardDescription className="text-gray-400">
            Relationship between attack input length and response length, colored by evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dashboardData.responseLengths.slice(0, 50)}> {/* Limit for performance */}
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="attackLength" 
                stroke="#9ca3af"
                fontSize={12}
                label={{ value: 'Attack Length', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#9ca3af' } }}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={12}
                label={{ value: 'Response Length', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value, name) => [value, name === 'responseLength' ? 'Response Length' : name]}
                labelFormatter={(label) => `Attack Length: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="responseLength" 
                stroke="#ec4899" 
                strokeWidth={2}
                dot={{ fill: '#ec4899', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#ec4899', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
