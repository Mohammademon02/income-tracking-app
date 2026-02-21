"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
  className?: string
  debounceMs?: number
  showClearButton?: boolean
}

export function SearchInput({
  placeholder = "Search...",
  value = "",
  onChange,
  onClear,
  className,
  debounceMs = 300,
  showClearButton = true
}: SearchInputProps) {
  const [searchValue, setSearchValue] = useState(value)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange?.(searchValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchValue, debounceMs, onChange])

  // Update local state when external value changes
  useEffect(() => {
    setSearchValue(value)
  }, [value])

  const handleClear = () => {
    setSearchValue("")
    onClear?.()
    onChange?.("")
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 pr-10 bg-white border-slate-200 focus:border-blue-300 focus:ring-blue-200"
        />
        {showClearButton && searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-slate-100"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
    </div>
  )
}

interface GlobalSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void
  className?: string
}

interface SearchFilters {
  accounts: boolean
  entries: boolean
  withdrawals: boolean
}

export function GlobalSearch({ onSearch, className }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({
    accounts: true,
    entries: true,
    withdrawals: true
  })

  useEffect(() => {
    onSearch(query, filters)
  }, [query, filters, onSearch])

  return (
    <div className={cn("space-y-4", className)}>
      <SearchInput
        placeholder="Search accounts, entries, withdrawals..."
        value={query}
        onChange={setQuery}
        className="w-full"
      />
      
      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.accounts}
            onChange={(e) => setFilters(prev => ({ ...prev, accounts: e.target.checked }))}
            className="rounded border-slate-300"
          />
          <span className="text-slate-700">Accounts</span>
        </label>
        
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.entries}
            onChange={(e) => setFilters(prev => ({ ...prev, entries: e.target.checked }))}
            className="rounded border-slate-300"
          />
          <span className="text-slate-700">Entries</span>
        </label>
        
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.withdrawals}
            onChange={(e) => setFilters(prev => ({ ...prev, withdrawals: e.target.checked }))}
            className="rounded border-slate-300"
          />
          <span className="text-slate-700">Withdrawals</span>
        </label>
      </div>
    </div>
  )
}