import { Navigation } from '@/components/navigation';
import { PipelineDetailsTable } from '@/components/pipeline-details-table';

export const metadata = {
  title: 'Pipeline Details - Pipeline UPP',
  description: 'Detalhes e exportação de cotações',
};

export default function PipelineDetailsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pipeline Details</h1>
          <p className="text-gray-600 mt-2">Visualize e exporte detalhes das cotações</p>
        </div>
        <PipelineDetailsTable />
      </main>
    </div>
  );
}
