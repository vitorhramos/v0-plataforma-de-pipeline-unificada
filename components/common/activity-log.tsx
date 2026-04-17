'use client';

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  description: string;
  timestamp: Date;
  type: 'update' | 'create' | 'delete';
}

interface ActivityLogProps {
  logs: ActivityLog[];
}

const getActionColor = (type: string) => {
  switch (type) {
    case 'update':
      return 'bg-blue-50 text-blue-700 border-l-4 border-l-blue-500';
    case 'create':
      return 'bg-green-50 text-green-700 border-l-4 border-l-green-500';
    case 'delete':
      return 'bg-red-50 text-red-700 border-l-4 border-l-red-500';
    default:
      return 'bg-gray-50';
  }
};

export function ActivityLog({ logs }: ActivityLogProps) {
  return (
    <div className="space-y-3">
      {logs.map(log => (
        <div key={log.id} className={`p-3 rounded ${getActionColor(log.type)}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium text-sm">{log.user}</div>
              <div className="text-sm opacity-75 mt-1">{log.description}</div>
            </div>
            <div className="text-xs opacity-60">
              {Math.floor((Date.now() - log.timestamp.getTime()) / 1000 / 60)} min ago
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
