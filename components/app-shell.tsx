"use client"

import React, { memo } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/actions/auth"
import { LayoutDashboard, Users, Calendar, Wallet, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Accounts", href: "/accounts", icon: Users },
  { name: "Daily Entries", href: "/entries", icon: Calendar },
  { name: "Withdrawals", href: "/withdrawals", icon: Wallet },
]

const NavigationItem = memo(({ item, isActive, onClick }: { 
  item: typeof navigation[0], 
  isActive: boolean, 
  onClick?: () => void 
}) => (
  <Link
    key={item.name}
    href={item.href}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
      isActive
        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200/50"
        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md"
    )}
  >
    <item.icon className={cn(
      "h-5 w-5 transition-transform duration-200",
      isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600 group-hover:scale-110"
    )} />
    {item.name}
  </Link>
))

NavigationItem.displayName = 'NavigationItem'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Survey Tracker</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="hover:bg-blue-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {mobileMenuOpen && (
          <nav className="border-t border-white/20 p-4 space-y-2 bg-white/95 backdrop-blur-md">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <NavigationItem
                  key={item.name}
                  item={item}
                  isActive={isActive}
                  onClick={() => setMobileMenuOpen(false)}
                />
              )
            })}
            <form action={logout}>
              <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200">
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </form>
          </nav>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col grow bg-white/80 backdrop-blur-md border-r border-white/20 shadow-xl">
          <div className="flex items-center h-16 px-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Survey Tracker</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <NavigationItem
                  key={item.name}
                  item={item}
                  isActive={isActive}
                />
              )
            })}
          </nav>
          <div className="p-4 border-t border-white/20">
            <form action={logout}>
              <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group">
                <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
