'use client';

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, RefreshCw } from "lucide-react";
import SystemPromptArea from "@/components/SystemPromptArea";
import PromptManager from "@/components/PromptManager";
import PromptAnalysisTable from "@/components/PromptAnalysisTable";
import AgentResponsesTable from "@/components/AgentResponsesTable";
import EvaluationDashboard from "@/components/EvaluationDashboard";

export default function Home() {
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSelectPrompt = (content: string) => {
    setSelectedPrompt(content);
  };

  const handlePromptSaved = useCallback(() => {
    // Force both components to refresh their data
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleGenerateAttacks = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/workflows/generate-attacks', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Wait a moment then refresh to see new attacks
        setTimeout(() => {
          setRefreshKey(prev => prev + 1); // This will refresh the tables
          setIsGenerating(false);
        }, 5000); // 5 second delay to let workflow complete
      } else {
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Error generating attacks:', error);
      setIsGenerating(false);
    }
  };

  const handleRunSecurityTest = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/workflows/run-security-test', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Wait then refresh to see new test results
        setTimeout(() => {
          setRefreshKey(prev => prev + 1); // This will refresh the tables
          setIsTesting(false);
        }, 10000); // 10 second delay for security tests
      } else {
        setIsTesting(false);
      }
    } catch (error) {
      console.error('Error running security test:', error);
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Workflow Control Buttons */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">AI Security Testing Dashboard</h1>
              <p className="text-gray-300">Generate attacks and run security tests with your n8n workflows</p>
            </div>
            
            <div className="flex justify-center gap-6">
              <Button
                onClick={handleGenerateAttacks}
                disabled={isGenerating}
                size="lg"
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-8 py-3 text-lg font-semibold min-w-[200px]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Generate New Attacks
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleRunSecurityTest}
                disabled={isTesting}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white px-8 py-3 text-lg font-semibold min-w-[200px]"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Run Security Test
                  </>
                )}
              </Button>
            </div>
            
            {(isGenerating || isTesting) && (
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm">
                  {isGenerating ? "Generating new attack patterns... This may take a few moments." : "Running security tests... Please wait."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Section: System Prompt Area and Prompt Manager */}
        <div className="flex gap-8">
          <SystemPromptArea 
            key={`system-${selectedPrompt}-${refreshKey}`} 
            initialPrompt={selectedPrompt || undefined}
            onPromptSaved={handlePromptSaved}
          />
          <PromptManager 
            key={`manager-${refreshKey}`}
            onSelectPrompt={handleSelectPrompt} 
          />
        </div>
        
        {/* Data Tables Section */}
        <div className="space-y-8">
          <PromptAnalysisTable key={`analysis-${refreshKey}`} />
          <AgentResponsesTable key={`responses-${refreshKey}`} />
        </div>

        {/* Dashboard Section - Moved to Bottom */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Test Dashboard</h2>
            <p className="text-gray-400">Test results and evaluation metrics</p>
          </div>
          <EvaluationDashboard key={`dashboard-${refreshKey}`} />
        </div>
      </div>
    </div>
  );
}
