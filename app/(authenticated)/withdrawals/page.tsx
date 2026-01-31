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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-balance">Withdrawals</h1>
          <p className="text-muted-foreground">Track your withdrawal requests</p>
        </div>
        <AddWithdrawalDialog accounts={accounts} />
      </div>

      <WithdrawalsTable withdrawals={withdrawals} accounts={accounts} />
    </div>
  )
}
