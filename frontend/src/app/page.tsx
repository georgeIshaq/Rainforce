import SystemPromptArea from "@/components/SystemPromptArea";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <SystemPromptArea />
      </div>
    </div>
  );
}
