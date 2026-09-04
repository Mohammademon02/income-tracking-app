"use client"

import React, { memo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
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

/**
 * One nav row.
 *
 * The active state used to be a background colour that simply appeared on
 * whichever row you had navigated to. Here it is a single element that travels:
 * `layoutId` makes framer treat the highlight on the old row and the highlight
 * on the new one as the same object and animate between them, so the chrome
 * shows you where you came from.
 *
 * `group` is required because the two navs — desktop sidebar and mobile sheet —
 * are both mounted at wide-then-narrow breakpoints. Two highlights sharing one
 * layoutId would be treated as one object and fly across the screen between
 * them.
 */
const NavigationItem = memo(function NavigationItem({
  item,
  isActive,
  group,
  onClick,
}: {
  item: (typeof navigation)[0]
  isActive: boolean
  group: string
  onClick?: () => void
}) {
  const reduced = useReducedMotion()

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      {isActive ? (
        <motion.span
          layoutId={reduced ? undefined : `${group}-active`}
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-lg bg-sidebar-accent"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        >
          {/* The accent is a 2px bar rather than a tint over the whole row: it
              marks the edge the row hangs off, and it survives the row's
              background being nearly the same colour as the sidebar. */}
          <span className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
        </motion.span>
      ) : null}
      <item.icon className={cn("size-4 shrink-0", isActive && "text-primary")} />
      {item.name}
    </Link>
  )
})

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpenedAt, setMenuOpenedAt] = useState<string | null>(null)
  const reduced = useReducedMotion()

  // The menu belongs to the page it was opened on. Deriving that from the
  // pathname closes it on navigation — including browser back and forward —
  // without an effect that sets state on every route change.
  const mobileMenuOpen = menuOpenedAt === pathname
  const setMobileMenuOpen = (open: boolean) => setMenuOpenedAt(open ? pathname : null)

  // Simple notification system
  useNotifications({
    enableDailyGoalAlerts: true,
    checkInterval: 60000 // Check every minute
  })

  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient light for the whole app. Fixed, so it stays put while content
          scrolls through it, and behind everything on a negative z-index. */}
      <div className="aurora" aria-hidden="true">
        <span />
      </div>

      {/* Mobile header */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl lg:hidden">
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
        {/* The panel is measured rather than given a height, so adding a nav
            item does not silently clip it the way a fixed max-height would. */}
        <AnimatePresence initial={false}>
          {mobileMenuOpen && (
            <motion.nav
              id="mobile-nav"
              className="overflow-hidden border-t border-border/60"
              initial={reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="space-y-1 p-3">
                {navigation.map((item) => (
                  <NavigationItem
                    key={item.name}
                    item={item}
                    group="mobile-nav"
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
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop sidebar. Its lg:w-64 pairs with the main column's lg:pl-64
          below — keep the two in step if either changes. */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col border-r border-border/60 bg-sidebar/70 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-2 border-b border-border/60 px-4">
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
                group="desktop-nav"
                isActive={pathname === item.href}
              />
            ))}
          </nav>
          <div className="border-t border-border/60 p-3">
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
      <main id="main-content" className="relative pt-14 lg:pt-0 lg:pl-64">
        {children}
      </main>
    </div>
  )
}
