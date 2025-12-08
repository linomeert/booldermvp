type CommentFormProps = {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  compact?: boolean;
};

export const CommentForm = ({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  compact = false,
}: CommentFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? "mb-3" : "mb-6"}>
      <div className="p-3">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add a comment..."
          rows={compact ? 2 : 3}
          className={
            compact
              ? "text-white bg-[#151920] w-full px-4 py-2 border border-[#2c2f36] rounded-md text-sm focus:outline-none focus:ring-primary-500 resize-none"
              : "text-white bg-[#151920] w-full px-4 py-2 border border-[#2c2f36] rounded-md focus:outline-none focus:ring-primary-500 resize-none"
          }
        />

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={!value.trim() || isSubmitting}
            className={
              compact
                ? "bg-[#0185c7] hover:bg-[#016a9c] disabled:bg-[#0185c7] text-white px-3 py-1.5 rounded-md text-xs"
                : "bg-[#0185c7] hover:bg-[#016a9c] disabled:bg-[#0185c7] text-white px-4 py-2 rounded-md"
            }
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </form>
  );
};
