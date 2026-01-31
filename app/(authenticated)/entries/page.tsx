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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-balance">Daily Entries</h1>
          <p className="text-muted-foreground">Track your daily survey points</p>
        </div>
        <AddEntryDialog accounts={accounts} />
      </div>

      <EntriesTable entries={entries} accounts={accounts} />
    </div>
  )
}
