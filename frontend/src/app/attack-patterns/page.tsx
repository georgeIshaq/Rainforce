import AttackPatternsTable from '@/components/AttackPatternsTable';
import SupabaseStatus from '@/components/SupabaseStatus';

export default function AttackPatternsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Attack Patterns Dashboard
          </h1>
          <p className="text-gray-400">
            Monitor and analyze attack patterns from your security data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <SupabaseStatus className="lg:col-span-1" />
          <div className="lg:col-span-2">
            {/* You can add more status cards here */}
          </div>
        </div>

        <AttackPatternsTable />
      </div>
    </div>
  );
}
