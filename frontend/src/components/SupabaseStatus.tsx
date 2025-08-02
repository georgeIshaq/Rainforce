'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

interface SupabaseStatusProps {
  className?: string;
}

export default function SupabaseStatus({ className }: SupabaseStatusProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  const checkSupabaseConnection = async () => {
    setChecking(true);
    setStatus('checking');
    
    try {
      const response = await fetch('/api/supabase/health');
      const result = await response.json();
      setStatus(result.success ? 'connected' : 'error');
      setLastChecked(new Date());
    } catch (err) {
      console.error('Supabase connection check failed:', err);
      setStatus('error');
      setLastChecked(new Date());
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          badgeVariant: 'default' as const,
          badgeClass: 'bg-green-900/20 text-green-400 border-green-400/20',
          text: 'Connected'
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-400',
          badgeVariant: 'destructive' as const,
          badgeClass: 'bg-red-900/20 text-red-400 border-red-400/20',
          text: 'Error'
        };
      default:
        return {
          icon: Clock,
          color: 'text-yellow-400',
          badgeVariant: 'secondary' as const,
          badgeClass: 'bg-yellow-900/20 text-yellow-400 border-yellow-400/20',
          text: 'Checking'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={`bg-gradient-to-br from-gray-900/95 to-black/95 border-gray-700/50 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
            <Database className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Supabase</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={statusConfig.badgeVariant}
            className={statusConfig.badgeClass}
          >
            <StatusIcon className={`h-3 w-3 mr-1 ${statusConfig.color} ${status === 'checking' ? 'animate-pulse' : ''}`} />
            {statusConfig.text}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={checkSupabaseConnection}
            disabled={checking}
            className="h-8 w-8 p-0 hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 text-gray-400 ${checking ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Last checked:</span>
            <span className="text-gray-300">
              {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Status:</span>
            <span className={statusConfig.color}>
              {status === 'connected' ? 'Database operational' : 
               status === 'error' ? 'Connection failed' : 
               'Checking connection...'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
