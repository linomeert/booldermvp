export const Message = ({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "error";
}) => {
  if (variant === "error") {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md text-center">
        {children}
      </div>
    );
  }
  return <div className="text-center text-gray-600">{children}</div>;
};
