"use client"

import React, { memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { LayoutDashboard, Users, Calendar, Wallet, LogOut, Settings } from "lucide-react"

import { logout } from "@/app/actions/auth"
import { NotificationCenter } from "@/components/notification-center"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", short: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Accounts", short: "Accounts", href: "/accounts", icon: Users },
  { name: "Daily Entries", short: "Entries", href: "/entries", icon: Calendar },
  { name: "Withdrawals", short: "Payouts", href: "/withdrawals", icon: Wallet },
  { name: "Settings", short: "Settings", href: "/settings", icon: Settings },
]

/**
 * One nav row in the sidebar.
 *
 * The active state used to be a background colour that simply appeared on
 * whichever row you had navigated to. Here it is a single element that travels:
 * `layoutId` makes framer treat the highlight on the old row and the highlight
 * on the new one as the same object and animate between them, so the chrome
 * shows you where you came from.
 *
 * `group` exists because the sidebar and the bottom bar are both mounted across
 * breakpoints. Two highlights sharing one layoutId would be treated as one
 * object and fly across the screen between them.
 */
const NavigationItem = memo(function NavigationItem({
  item,
  isActive,
  group,
}: {
  item: (typeof navigation)[0]
  isActive: boolean
  group: string
}) {
  const reduced = useReducedMotion()

  return (
    <Link
      href={item.href}
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

/**
 * One tab in the phone-width bar.
 *
 * This replaces a hamburger that opened a five-item sheet. The app installs as
 * a PWA and is opened one-handed on a phone; a menu that has to be opened
 * before it can be read is the wrong shape for five destinations that all fit
 * on screen at once.
 */
const NavigationTab = memo(function NavigationTab({
  item,
  isActive,
}: {
  item: (typeof navigation)[0]
  isActive: boolean
}) {
  const reduced = useReducedMotion()

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex flex-1 flex-col items-center gap-1 py-2 text-[0.6875rem] font-medium transition-colors",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      {isActive ? (
        <motion.span
          layoutId={reduced ? undefined : "tab-active"}
          aria-hidden="true"
          className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      ) : null}
      <item.icon className="size-5 shrink-0" />
      {item.short}
    </Link>
  )
})

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

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

      {/* Phone header. Brand and utilities only — navigation lives in the bar
          at the bottom, where a thumb can reach it. */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl lg:hidden">
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
            <form action={logout}>
              <Button
                variant="ghost"
                size="icon"
                type="submit"
                aria-label="Sign out"
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

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

      {/*
        The bottom padding clears the tab bar, and the safe-area inset clears
        the home indicator on a phone running this as an installed app — without
        it the last row of every list sits under the bar.
      */}
      <main
        id="main-content"
        className="relative pt-14 pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pt-0 lg:pr-0 lg:pb-0 lg:pl-64"
      >
        {children}
      </main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <div className="flex items-stretch">
          {navigation.map((item) => (
            <NavigationTab key={item.name} item={item} isActive={pathname === item.href} />
          ))}
        </div>
      </nav>
    </div>
  )
}
