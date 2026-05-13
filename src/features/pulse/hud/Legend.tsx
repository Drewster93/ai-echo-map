export function Legend() {
  return (
    <div className="glass absolute bottom-5 left-5 z-20 flex flex-col gap-2 rounded-xl px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60">
        AI Mention Intensity
      </p>
      <div
        className="h-2.5 w-56 rounded-full"
        style={{
          background:
            "linear-gradient(to right, #2A1452 0%, #4B1A99 25%, #6B1FD6 50%, #860EFF 75%, #C026FF 100%)",
          boxShadow: "0 0 16px rgba(134,14,255,0.45)",
        }}
      />
      <div className="flex justify-between text-[10px] text-white/60">
        <span>Low</span>
        <span className="italic text-white/40">avg per hex</span>
        <span>High</span>
      </div>
    </div>
  );
}
