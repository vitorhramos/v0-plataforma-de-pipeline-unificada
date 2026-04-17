'use client';

interface AlertBadgesProps {
  expiresIn?: number; // days
  isNew?: boolean;
  isLost?: boolean;
  isHot?: boolean; // updated < 24h
}

export function AlertBadges({ expiresIn, isNew, isLost, isHot }: AlertBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {expiresIn && expiresIn <= 3 && (
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          Expires in {expiresIn} days
        </span>
      )}
      {isNew && (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          New
        </span>
      )}
      {isLost && (
        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
          Lost
        </span>
      )}
      {isHot && (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          Hot Deal
        </span>
      )}
    </div>
  );
}
