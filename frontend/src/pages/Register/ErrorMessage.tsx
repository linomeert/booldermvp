interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => (
  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{message}</div>
);
