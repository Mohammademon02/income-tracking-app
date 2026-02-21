export default function DashboardLoading() {
    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50/50 to-blue-50/30 min-h-screen animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-9 w-96 bg-slate-200 rounded-lg" />
                    <div className="h-5 w-64 bg-slate-100 rounded" />
                </div>
            </div>

            {/* Stats cards skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-36 rounded-xl bg-slate-200" />
                ))}
            </div>

            {/* Performance + Quick Stats skeleton */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 h-80 rounded-xl bg-slate-100 border border-slate-200" />
                <div className="h-80 rounded-xl bg-slate-100 border border-slate-200" />
            </div>

            {/* Recent activity skeleton */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="h-72 rounded-xl bg-slate-100 border border-slate-200" />
                <div className="h-72 rounded-xl bg-slate-100 border border-slate-200" />
            </div>
        </div>
    )
}
