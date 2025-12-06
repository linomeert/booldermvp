import catGif from "../../assets/cat.gif";

interface SuccessModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

export const SuccessModal = ({ isOpen, onContinue }: SuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
        <div className="text-center">
          <img
            src={catGif}
            alt="Cat celebrating"
            className="mx-auto mb-4 w-32 h-32 object-contain rounded-lg shadow"
          />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Climb Logged!
          </h3>
          <p className="text-gray-600 mb-6">
            Your climb has been successfully logged.
          </p>
          <button
            onClick={onContinue}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
