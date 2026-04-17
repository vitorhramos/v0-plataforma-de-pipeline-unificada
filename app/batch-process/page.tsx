import BatchProcessPage from '@/components/pages/batch-process-page';

export const metadata = {
  title: 'Batch Process - Pipeline UPP',
  description: 'Execute bulk operations on multiple quotes with process logging',
};

export default function BatchProcessRoute() {
  return <BatchProcessPage />;
}
