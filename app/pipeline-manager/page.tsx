import PipelineManagerComponent from '@/components/pipeline-manager';

export const metadata = {
  title: 'Pipeline Manager - Pipeline UPP',
  description: 'Managerial view with toggle charts/table and 6 filters',
};

export default function ManagerPage() {
  return <PipelineManagerComponent />;
}
