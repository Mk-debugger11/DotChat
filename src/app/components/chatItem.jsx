export default function ChatItem({ name, message, time, unread, typing, active }) {
  return (
    <div
      className={`
        flex items-center gap-3 p-2 rounded-xl cursor-pointer
        ${active ? "bg-purple-50" : "hover:bg-gray-50"}`}>
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gray-300" />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800">{name}</p>
        <p
          className={`text-xs ${
            typing ? "text-purple-600 italic" : "text-gray-500"
          }`}
        >
          {message}
        </p>
      </div>
      <div className="text-right text-xs text-gray-400">
        <p>{time}</p>
        {unread && (
          <span className="inline-block mt-1 w-2 h-2 bg-purple-600 rounded-full" />
        )}
      </div>
    </div>
  );
}
