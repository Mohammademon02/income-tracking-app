import React from "react"
import { redirect } from "next/navigation"
import { verifySession } from "@/lib/auth"
import { AppShell } from "@/components/app-shell"

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()

  if (!session) {
    redirect("/login")
  }

  return <AppShell>{children}</AppShell>
}
