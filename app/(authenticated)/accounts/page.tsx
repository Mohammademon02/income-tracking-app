import { getAccounts } from "@/app/actions/accounts"
import { AccountsTable } from "@/components/accounts-table"
import { AddAccountDialog } from "@/components/add-account-dialog"
import { PageContainer, PageHeader } from "@/components/page-shell"

export default async function AccountsPage() {
  const accounts = await getAccounts()

  return (
    <PageContainer>
      <PageHeader
        title="Accounts"
        description="Your survey platform accounts and what each is worth."
        actions={<AddAccountDialog />}
      />
      <AccountsTable accounts={accounts} />
    </PageContainer>
  )
}
