export default function ChatMessages() {
  return (
    <div className="flex-1 px-6 py-4 overflow-y-auto space-y-6 bg-gray-50">
      <div className="flex justify-center">
        <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">
          Typography options for our website
        </span>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-300"/>
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">
            Daniel Garcia
          </p>
          <div className="bg-white rounded-2xl px-4 py-2 shadow-sm max-w-md">
            <p className="text-sm text-gray-800">
              Check out pls this initial sketch for our new project? 
            </p>
            <div className="flex justify-end text-[10px] text-gray-400 mt-1">
              12:04 ✓✓
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-300" />
        <div className="bg-gray-900 rounded-3xl p-4 shadow-lg max-w-lg text-white">
          <p className="text-sm font-semibold mb-2">Recent Collection</p>
          <div className="h-40 rounded-xl bg-gray-700 flex items-center justify-center text-gray-300 text-sm">
            Preview Content
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Adventure Robot • $14.99
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="bg-green-200 rounded-2xl px-4 py-2 shadow-sm max-w-md">
          <p className="text-sm text-gray-800">
            Hi team Let’s hop on call to discuss the new project.
          </p>
          <div className="flex justify-end text-[10px] text-gray-500 mt-1">
            12:11 ✓✓
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="bg-green-200 rounded-2xl px-4 py-2 shadow-sm">
          <p className="text-sm text-gray-800">Good Concepts!</p>
          <div className="flex justify-end text-[10px] text-gray-500 mt-1">
            12:13 ✓✓
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-300" />
        <p className="text-sm text-gray-500 italic">Monika is typing...</p>
      </div>

    </div>
  );
}
