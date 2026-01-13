import ChatItem from './chatItem.jsx'

export default function ChatSidebar() {
  return (
    <div className="w-[320px] h-full bg-white rounded-2xl shadow-sm p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
        </button>
      </div>
      <div className="flex items-center gap-4 mb-4 overflow-x-auto">
        {["Daniel", "Nixtio", "Anna", "Nelly"].map((name, i) => (
          <div key={i} className="flex flex-col items-center text-xs">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gray-300" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <span className="mt-1 text-gray-600">{name}</span>
          </div>
        ))}
        <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-semibold">
          +5
        </div>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search or start a message"
          className="w-full px-4 py-2 rounded-full bg-gray-100 outline-none text-sm"
        />
      </div>
      <div className="flex-1 overflow-y-auto space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-2">
            📌 PINNED CHATS
          </h3>

          <ChatItem
            name="George Lobko"
            message="Thanks for the quick response..."
            time="09:41"
            unread
          />

          <ChatItem
            name="Amelia Korne"
            message="I'm stuck in traffic ..."
            time="10:25"
            unread
          />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-2">
             ALL CHATS
          </h3>

          <ChatItem
            name="Hasima Medvedeva"
            message="Hasima is typing..."
            time="12:23"
            typing
          />

          <ChatItem
            name="Nixtio Team"
            message="Daniel is typing..."
            time="12:13"
            active
          />

          <ChatItem
            name="Anatoly Ferusso"
            message="Sorry for the delay "
            time="11:53"
          />

          <ChatItem
            name="Anna Gordienko"
            message="Anna is typing..."
            time="10:41"
            typing
          />
        </div>

      </div>
    </div>
  );
}
