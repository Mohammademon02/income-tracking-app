import { getAccounts } from "@/app/actions/accounts"
import { getWithdrawals } from "@/app/actions/withdrawals"
import { AddWithdrawalDialog } from "@/components/add-withdrawal-dialog"
import { PageContainer, PageHeader } from "@/components/page-shell"
import { ImportDialog } from "@/components/ui/import-dialog"
import { WithdrawalsTable } from "@/components/withdrawals-table"

export default async function WithdrawalsPage() {
  const [withdrawals, accounts] = await Promise.all([getWithdrawals(), getAccounts()])

  return (
    <PageContainer>
      <PageHeader
        title="Withdrawals"
        description="Payout requests and how long each took to clear."
        actions={
          <>
            <ImportDialog type="withdrawals" accounts={accounts} />
            <AddWithdrawalDialog accounts={accounts} />
          </>
        }
      />
      <WithdrawalsTable withdrawals={withdrawals} accounts={accounts} />
    </PageContainer>
  )
}
