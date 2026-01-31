import { getWithdrawals } from "@/app/actions/withdrawals"
import { getAccounts } from "@/app/actions/accounts"
import { WithdrawalsTable } from "@/components/withdrawals-table"
import { AddWithdrawalDialog } from "@/components/add-withdrawal-dialog"

export default async function WithdrawalsPage() {
  const [withdrawals, accounts] = await Promise.all([
    getWithdrawals(),
    getAccounts(),
  ])

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50/50 to-blue-50/30 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Withdrawals
          </h1>
          <p className="text-slate-600 mt-1">Track your withdrawal requests</p>
        </div>
        <AddWithdrawalDialog accounts={accounts} />
      </div>

      <div className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg rounded-lg">
        <WithdrawalsTable withdrawals={withdrawals} accounts={accounts} />
      </div>
    </div>
  )
}
