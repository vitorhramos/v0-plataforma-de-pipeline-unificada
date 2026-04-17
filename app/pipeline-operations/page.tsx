import PipelineOperations from '@/components/pipeline-operations-new';

export const metadata = {
  title: 'Pipeline Operations - Pipeline UPP',
  description: 'Gestão operacional com edição manual ou em massa via Excel',
};

export default function OperationsPage() {
  return <PipelineOperations />;
}
