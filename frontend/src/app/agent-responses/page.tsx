'use client';

import AgentResponsesTable from '@/components/AgentResponsesTable';

export default function AgentResponsesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Agent Responses</h1>
          <p className="text-gray-400">
            View and analyze agent responses to various attack patterns.
          </p>
        </div>
        
        <AgentResponsesTable />
      </div>
    </div>
  );
}
