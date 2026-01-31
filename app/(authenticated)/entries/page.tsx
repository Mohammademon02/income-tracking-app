import { getEntries } from "@/app/actions/entries"
import { getAccounts } from "@/app/actions/accounts"
import { EntriesTable } from "@/components/entries-table"
import { AddEntryDialog } from "@/components/add-entry-dialog"

export default async function EntriesPage() {
  const [entries, accounts] = await Promise.all([
    getEntries(),
    getAccounts(),
  ])

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50/50 to-blue-50/30 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Daily Entries
          </h1>
          <p className="text-slate-600 mt-1">Track your daily survey points and earnings</p>
        </div>
        <AddEntryDialog accounts={accounts} />
      </div>

      <div className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg rounded-lg">
        <EntriesTable entries={entries} accounts={accounts} />
      </div>
    </div>
  )
}
