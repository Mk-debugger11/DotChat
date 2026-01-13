export default function ChatInput() {
  return (
    <div className="w-full px-4 py-3">
      <div
        className="
          flex items-center gap-3
          w-full
          rounded-full
          px-4 py-2
          bg-white/60
          backdrop-blur-md
          shadow-sm
          border border-white/30
        "
      >
        <input
          type="text"
          placeholder="Type Message..."
          className="
            flex-1
            bg-transparent
            outline-none
            text-sm
            text-gray-700
            placeholder-gray-400
          "
        />
        <button
          className="
            px-4 py-1.5
            rounded-full
            text-sm font-semibold
            text-white
            bg-blue-600
            hover:bg-blue-700
            active:scale-95
            transition
          "
        >
          Enter
        </button>
      </div>
    </div>
  );
}
