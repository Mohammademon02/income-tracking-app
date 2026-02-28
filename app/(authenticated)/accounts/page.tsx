import { getAccounts } from "@/app/actions/accounts"
import { AccountsTable } from "@/components/accounts-table"
import { AddAccountDialog } from "@/components/add-account-dialog"

export default async function AccountsPage() {
  const accounts = await getAccounts()

  return (
    <div className="px-3 py-6 sm:px-6 space-y-8 bg-gradient-to-br from-slate-50/50 to-blue-50/30 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Accounts
          </h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">Manage your survey platform accounts</p>
        </div>
        <AddAccountDialog />
      </div>

      <div className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg rounded-lg">
        <AccountsTable accounts={accounts} />
      </div>
    </div>
  )
}
