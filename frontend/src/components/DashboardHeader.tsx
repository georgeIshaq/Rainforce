'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { 
  Download, 
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Activity
} from 'lucide-react';

interface DashboardHeaderProps {
  totalResponses: number;
  recommendationRate: number;
  onRefresh: () => void;
  onExport?: () => void;
}

export default function DashboardHeader({ 
  totalResponses, 
  recommendationRate, 
  onRefresh,
  onExport 
}: DashboardHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getRecommendationStatus = () => {
    if (recommendationRate >= 80) return { color: 'bg-green-500', status: 'Excellent', icon: TrendingUp };
    if (recommendationRate >= 60) return { color: 'bg-yellow-500', status: 'Good', icon: Activity };
    return { color: 'bg-red-500', status: 'Needs Attention', icon: AlertCircle };
  };

  const recStatus = getRecommendationStatus();
  const StatusIcon = recStatus.icon;

  return (
    <Card className="bg-gradient-to-r from-gray-800 via-gray-900 to-black border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              Test Evaluation Dashboard
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Test results and evaluation metrics
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Tests */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Tests</p>
                <p className="text-2xl font-bold text-white">{totalResponses.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Evaluation Rate */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Evaluation Rate</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-white">{recommendationRate}%</p>
                  <Badge 
                    variant="secondary" 
                    className={`${recStatus.color} text-white text-xs`}
                  >
                    {recStatus.status}
                  </Badge>
                </div>
              </div>
              <div className={`w-10 h-10 ${recStatus.color}/20 rounded-lg flex items-center justify-center`}>
                <StatusIcon className={`w-5 h-5 text-white`} />
              </div>
            </div>
          </div>

          {/* Test Summary */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">Test Summary</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Evaluated:</span>
                  <span className="text-green-400 font-medium">
                    {Math.round((totalResponses * recommendationRate) / 100)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Pending:</span>
                  <span className="text-yellow-400 font-medium">
                    {totalResponses - Math.round((totalResponses * recommendationRate) / 100)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
