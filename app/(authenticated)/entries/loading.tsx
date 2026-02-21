export default function EntriesLoading() {
    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50/50 to-blue-50/30 min-h-screen animate-pulse">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-9 w-48 bg-slate-200 rounded-lg" />
                    <div className="h-5 w-72 bg-slate-100 rounded" />
                </div>
                <div className="h-10 w-32 bg-slate-200 rounded-lg" />
            </div>
            <div className="bg-white/80 border border-white/60 shadow-lg rounded-lg overflow-hidden">
                <div className="h-12 bg-slate-100 border-b border-slate-200" />
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-14 border-b border-slate-100 px-4 flex items-center gap-4">
                        <div className="h-4 w-24 bg-slate-100 rounded" />
                        <div className="h-4 w-32 bg-slate-100 rounded" />
                        <div className="h-4 w-20 bg-slate-100 rounded ml-auto" />
                    </div>
                ))}
            </div>
        </div>
    )
}
