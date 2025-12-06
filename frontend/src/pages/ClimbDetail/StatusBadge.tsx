export const StatusBadge = ({
  status,
}: {
  status: "top" | "project" | string;
}) => {
  const isTop = status === "top";
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-bold ${
        isTop ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      {isTop ? "✓ TOPPED" : "📍 PROJECT"}
    </span>
  );
};
