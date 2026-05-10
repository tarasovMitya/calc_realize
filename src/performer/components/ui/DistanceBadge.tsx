import { Navigation, Clock } from "lucide-react";

interface DistanceBadgeProps {
  distance: string;
  etaMinutes?: number;
}

export function DistanceBadge({ distance, etaMinutes }: DistanceBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
        <Navigation size={10} />
        {distance}
      </span>
      {etaMinutes !== undefined && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
          <Clock size={10} />
          {etaMinutes} мин
        </span>
      )}
    </div>
  );
}
