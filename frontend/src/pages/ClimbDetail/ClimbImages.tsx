export const ClimbImages = ({
  images,
  mediaUrl,
  grade,
}: {
  images?: string[];
  mediaUrl?: string | null;
  grade: string;
}) => {
  if ((images && images.length > 0) || mediaUrl) {
    if (images && images.length > 0) {
      const single = images.length === 1;
      return (
        <div className="w-full">
          <div
            className={
              single
                ? "w-full aspect-square bg-gray-200"
                : "grid grid-cols-2 gap-1 bg-gray-200"
            }
          >
            {images.map((url, index) => (
              <img
                key={url ?? index}
                src={url}
                alt={`Climb ${grade} - Photo ${index + 1}`}
                className={
                  single
                    ? "w-full h-full object-cover"
                    : "w-full aspect-square object-cover"
                }
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full aspect-square bg-gray-200">
        <img
          src={mediaUrl!}
          alt={`Climb ${grade}`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-full aspect-square bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
      <span className="text-9xl opacity-50">🧗</span>
    </div>
  );
};
