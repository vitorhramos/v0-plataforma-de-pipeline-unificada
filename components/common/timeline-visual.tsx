'use client';

interface TimelineEvent {
  id: string;
  type: 'create' | 'update' | 'delete' | 'comment';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
}

interface TimelineVisualProps {
  events: TimelineEvent[];
}

const getColorByType = (type: string) => {
  switch (type) {
    case 'create':
      return 'bg-green-500';
    case 'update':
      return 'bg-blue-500';
    case 'delete':
      return 'bg-red-500';
    case 'comment':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};

export function TimelineVisual({ events }: TimelineVisualProps) {
  return (
    <div className="relative">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4 pb-8 relative">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 ${getColorByType(event.type)} rounded-full border-4 border-white shadow-sm`} />
            {index !== events.length - 1 && (
              <div className="w-1 h-12 bg-gray-200 mt-2" />
            )}
          </div>

          <div className="flex-1 pt-1">
            <div className="font-medium text-sm text-gray-900">{event.title}</div>
            <div className="text-xs text-gray-500 mt-1">{event.description}</div>
            {event.user && <div className="text-xs text-gray-600 mt-1 font-medium">by {event.user}</div>}
            <div className="text-xs text-gray-400 mt-2">{formatRelativeTime(event.timestamp)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
