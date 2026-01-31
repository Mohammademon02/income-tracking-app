import { getAccounts } from "@/app/actions/accounts"
import { AccountsTable } from "@/components/accounts-table"
import { AddAccountDialog } from "@/components/add-account-dialog"

export default async function AccountsPage() {
  const accounts = await getAccounts()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-balance">Accounts</h1>
          <p className="text-muted-foreground">Manage your survey platform accounts</p>
        </div>
        <AddAccountDialog />
      </div>

      <AccountsTable accounts={accounts} />
    </div>
  )
}
