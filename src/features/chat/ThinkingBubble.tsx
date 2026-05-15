// src/features/chat/ThinkingBubble.tsx

export default function ThinkingBubble() {
  return (
    <div className="py-6 border-b border-pk-border/40">

      {/* Citation header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="font-mono text-[9px] text-pk-green uppercase tracking-[0.4em] animate-pulse">
          # SEARCHING CORPUS...
        </span>
      </div>

      {/* Scan line animation container */}
      <div className="relative h-[2px] bg-pk-border/40 overflow-visible mb-3">
        <div className="scan-line" />
      </div>

      {/* Status text */}
      <p className="font-mono text-[10px] text-pk-muted uppercase tracking-[0.2em]">
        Querying constitutional corpus &nbsp;·&nbsp; Indexing references...
      </p>

    </div>
  );
}
