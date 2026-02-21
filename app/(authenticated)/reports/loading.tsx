export default function ReportsLoading() {
    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50/50 to-blue-50/30 min-h-screen animate-pulse">
            <div className="h-6 w-40 bg-slate-200 rounded" />
            <div className="space-y-2">
                <div className="h-9 w-64 bg-slate-200 rounded-lg" />
                <div className="h-5 w-72 bg-slate-100 rounded" />
            </div>
            <div className="h-12 w-64 rounded-xl bg-slate-200" />
            <div className="grid gap-6 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 rounded-xl bg-slate-100 border border-slate-200" />
                ))}
            </div>
            <div className="h-72 rounded-xl bg-slate-100 border border-slate-200" />
        </div>
    )
}
