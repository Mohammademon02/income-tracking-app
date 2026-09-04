import { getAccounts } from "@/app/actions/accounts"
import { getEntries } from "@/app/actions/entries"
import { AddEntryDialog } from "@/components/add-entry-dialog"
import { EntriesTable } from "@/components/entries-table"
import { PageContainer, PageHeader } from "@/components/page-shell"

export default async function EntriesPage() {
  const [entries, accounts] = await Promise.all([getEntries(), getAccounts()])

  return (
    <PageContainer>
      <PageHeader
        title="Daily entries"
        description="Points recorded against each account, day by day."
        actions={<AddEntryDialog accounts={accounts} />}
      />
      <EntriesTable entries={entries} accounts={accounts} />
    </PageContainer>
  )
}
