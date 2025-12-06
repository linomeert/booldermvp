import { formatDate } from "../../utils/date";

export const DetailsGrid = ({
  style,
  attempts,
  date,
}: {
  style?: string | null;
  attempts?: number | null;
  date: string;
}) => (
  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
    {style && (
      <div>
        <div className="text-sm text-gray-600">Style</div>
        <div className="text-lg font-semibold text-gray-900 capitalize">
          {style}
        </div>
      </div>
    )}
    {typeof attempts === "number" && (
      <div>
        <div className="text-sm text-gray-600">Attempts</div>
        <div className="text-lg font-semibold text-gray-900">{attempts}</div>
      </div>
    )}
    <div>
      <div className="text-sm text-gray-600">Date</div>
      <div className="text-lg font-semibold text-gray-900">
        {formatDate(date)}
      </div>
    </div>
  </div>
);
