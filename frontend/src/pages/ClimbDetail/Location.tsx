export const Location = ({
  locationType,
  gymName,
  cragName,
}: {
  locationType: "indoor" | "outdoor" | string;
  gymName?: string;
  cragName?: string;
}) => (
  <div className="mb-4">
    <div className="flex items-center space-x-2 text-gray-700">
      <span className="text-2xl">
        {locationType === "indoor" ? "🏢" : "⛰️"}
      </span>
      <span className="text-lg font-medium">
        {gymName || cragName || "Unknown location"}
      </span>
      <span className="text-sm text-gray-500 capitalize">({locationType})</span>
    </div>
  </div>
);
