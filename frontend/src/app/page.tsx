'use client';

import { useState, useCallback } from "react";
import SystemPromptArea from "@/components/SystemPromptArea";
import PromptManager from "@/components/PromptManager";
import PromptAnalysisTable from "@/components/PromptAnalysisTable";
import AgentResponsesTable from "@/components/AgentResponsesTable";
import EvaluationDashboard from "@/components/EvaluationDashboard";

export default function Home() {
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectPrompt = (content: string) => {
    setSelectedPrompt(content);
  };

  const handlePromptSaved = useCallback(() => {
    // Force both components to refresh their data
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
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
          <PromptAnalysisTable />
          <AgentResponsesTable />
        </div>

        {/* Dashboard Section - Moved to Bottom */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Test Dashboard</h2>
            <p className="text-gray-400">Test results and evaluation metrics</p>
          </div>
          <EvaluationDashboard />
        </div>
      </div>
    </div>
  );
}
