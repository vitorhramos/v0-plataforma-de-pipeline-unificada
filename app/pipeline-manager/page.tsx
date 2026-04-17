import { Navigation } from '@/components/navigation';
import { PipelineManager } from '@/components/pipeline-manager';

export const metadata = {
  title: 'Pipeline Manager - Pipeline UPP',
  description: 'Gerenciamento e edição em lote de cotações',
};

export default function PipelineManagerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pipeline Manager</h1>
          <p className="text-gray-600 mt-2">Editar cotações em lote e gerenciar pipeline</p>
        </div>
        <PipelineManager />
      </main>
    </div>
  );
}
