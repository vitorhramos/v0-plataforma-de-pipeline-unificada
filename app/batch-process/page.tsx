import BatchProcessComponent from '@/components/batch-process';

export const metadata = {
  title: 'Batch Process - Pipeline UPP',
  description: 'Execute bulk operations on multiple quotes with process logging',
};

export default function BatchProcessPage() {
  return <BatchProcessComponent />;
}
