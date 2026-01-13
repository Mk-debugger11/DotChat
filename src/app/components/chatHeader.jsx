export default function ChatHeader() {
  return (
    <div className="
      h-full w-full flex items-center justify-between px-4
      border-b border-white/20
      bg-white/30
      backdrop-blur-md
      shadow-sm
    ">
      <div className="flex items-center gap-3">
        <div className="flex">
          <img src="/user.png" className="w-12 h-12 rounded-full border border-white/40 bg-gray-300"/>
        </div>
        <div>
          <h2 className="text-md font-semibold text-gray-900">
            Nishant Jangra
          </h2>
          <p className="text-xs font-semibold text-green-600">
            Online
          </p>
        </div>
      </div>
    </div>
  );
}

