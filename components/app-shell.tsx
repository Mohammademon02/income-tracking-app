"use client"

import React, { memo, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Calendar, Wallet, LogOut, Menu, X, Settings } from "lucide-react"

import { logout } from "@/app/actions/auth"
import { NotificationCenter } from "@/components/notification-center"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Accounts", href: "/accounts", icon: Users },
  { name: "Daily Entries", href: "/entries", icon: Calendar },
  { name: "Withdrawals", href: "/withdrawals", icon: Wallet },
  { name: "Settings", href: "/settings", icon: Settings },
]

const NavigationItem = memo(({ item, isActive, onClick }: {
  item: typeof navigation[0],
  isActive: boolean,
  onClick?: () => void
}) => (
  <Link
    href={item.href}
    onClick={onClick}
    aria-current={isActive ? "page" : undefined}
    className={cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
    )}
  >
    <item.icon className={cn("size-4 shrink-0", isActive && "text-primary")} />
    {item.name}
  </Link>
))

NavigationItem.displayName = 'NavigationItem'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Simple notification system
  useNotifications({
    enableDailyGoalAlerts: true,
    checkInterval: 60000 // Check every minute
  })

  // Close the mobile nav on navigation. Without this it stays open behind the
  // new page after a link is tapped.
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="fixed inset-x-0 top-0 z-50 border-b bg-background/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Image
            src="/Logo.png"
            alt="SurvTrack"
            width={120}
            height={32}
            className="h-8 w-auto dark:brightness-0 dark:invert"
            priority
          />
          <div className="flex items-center gap-1">
            <NotificationCenter />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav id="mobile-nav" className="space-y-1 border-t bg-background p-3">
            {navigation.map((item) => (
              <NavigationItem
                key={item.name}
                item={item}
                isActive={pathname === item.href}
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
            <form action={logout}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </form>
          </nav>
        )}
      </div>

      {/* Desktop sidebar. Its lg:w-64 pairs with the main column's lg:pl-64
          below — keep the two in step if either changes. */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col border-r bg-sidebar">
          <div className="flex h-16 items-center justify-between gap-2 border-b px-4">
            <Image
              src="/Logo.png"
              alt="SurvTrack"
              width={160}
              height={40}
              className="h-8 w-auto dark:brightness-0 dark:invert"
              priority
            />
            <div className="flex items-center gap-1">
              <NotificationCenter />
              <ThemeToggle />
            </div>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {navigation.map((item) => (
              <NavigationItem
                key={item.name}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </nav>
          <div className="border-t p-3">
            <form action={logout}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main id="main-content" className="pt-14 lg:pt-0 lg:pl-64">
        {children}
      </main>
    </div>
  )
}
