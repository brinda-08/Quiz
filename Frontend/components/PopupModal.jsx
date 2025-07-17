export default function PopupModal({ message, onClose, buttonText, onButtonClick }) {
  return (
    <div className="fixed inset-0 z-[999] bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-[#1e1c36] text-white p-8 rounded-xl text-center shadow-2xl max-w-md w-full">
        <p className="text-lg">{message}</p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onClose}
            className="bg-[#6b4df7] hover:bg-[#5940d3] text-white px-5 py-2 rounded-lg transition"
          >
            OK
          </button>
          {buttonText && onButtonClick && (
            <button
              onClick={onButtonClick}
              className="bg-[#6b4df7] hover:bg-[#5940d3] text-white px-5 py-2 rounded-lg transition"
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
