'use client';

import { useState, useCallback } from "react";
import SystemPromptArea from "@/components/SystemPromptArea";
import PromptManager from "@/components/PromptManager";
import PromptAnalysisTable from "@/components/PromptAnalysisTable";
import AgentResponsesTable from "@/components/AgentResponsesTable";

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
        
        {/* Bottom Section: Data Tables */}
        <div className="space-y-8">
          <PromptAnalysisTable />
          <AgentResponsesTable />
        </div>
      </div>
    </div>
  );
}
