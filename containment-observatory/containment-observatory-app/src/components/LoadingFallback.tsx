export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-mono tracking-widest" style={{ color: '#64748b' }}>
          LOADING ASSETS...
        </span>
      </div>
    </div>
  )
}
