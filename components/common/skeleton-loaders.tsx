'use client';

export function SkeletonTable({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="w-12 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
          </div>
          <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg p-6 space-y-4 border border-gray-200">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6" />
      </div>
    </div>
  );
}
