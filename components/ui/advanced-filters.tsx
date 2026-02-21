"use client"

import { useState } from "react"
import { Filter, X, Calendar, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface FilterState {
  dateFrom?: string
  dateTo?: string
  minPoints?: number
  maxPoints?: number
  minAmount?: number
  maxAmount?: number
  accounts?: string[]
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface AdvancedFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  accounts?: Array<{ id: string; name: string }>
  showAccountFilter?: boolean
  showStatusFilter?: boolean
  showAmountFilter?: boolean
  showPointsFilter?: boolean
  showDateFilter?: boolean
  className?: string
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  accounts = [],
  showAccountFilter = true,
  showStatusFilter = false,
  showAmountFilter = false,
  showPointsFilter = true,
  showDateFilter = true,
  className
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className={cn("bg-white border border-slate-200 rounded-xl shadow-sm", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 rounded-lg">
                  <Filter className="h-4 w-4 text-slate-600" />
                </div>
                <span className="font-semibold text-slate-800">Advanced Filters</span>
              </div>
              {activeFilterCount > 0 && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  {activeFilterCount} active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearFilters()
                  }}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-slate-500">
                {isOpen ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              
              {/* Date Range Filter */}
              {showDateFilter && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date Range
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      placeholder="From date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => updateFilter('dateFrom', e.target.value)}
                      className="h-9"
                    />
                    <Input
                      type="date"
                      placeholder="To date"
                      value={filters.dateTo || ''}
                      onChange={(e) => updateFilter('dateTo', e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
              )}

              {/* Points Range Filter */}
              {showPointsFilter && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Points Range
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Min points"
                      value={filters.minPoints || ''}
                      onChange={(e) => updateFilter('minPoints', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="h-9"
                    />
                    <Input
                      type="number"
                      placeholder="Max points"
                      value={filters.maxPoints || ''}
                      onChange={(e) => updateFilter('maxPoints', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="h-9"
                    />
                  </div>
                </div>
              )}

              {/* Amount Range Filter */}
              {showAmountFilter && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Amount Range ($)
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Min amount"
                      value={filters.minAmount || ''}
                      onChange={(e) => updateFilter('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="h-9"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Max amount"
                      value={filters.maxAmount || ''}
                      onChange={(e) => updateFilter('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="h-9"
                    />
                  </div>
                </div>
              )}

              {/* Account Filter */}
              {showAccountFilter && accounts.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">
                    Accounts
                  </Label>
                  <Select
                    value={filters.accounts?.[0] || 'all'}
                    onValueChange={(value) => 
                      updateFilter('accounts', value === 'all' ? undefined : [value])
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All accounts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All accounts</SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status Filter */}
              {showStatusFilter && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">
                    Status
                  </Label>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => 
                      updateFilter('status', value === 'all' ? undefined : value)
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sort Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">
                  Sort By
                </Label>
                <div className="space-y-2">
                  <Select
                    value={filters.sortBy || 'date'}
                    onValueChange={(value) => updateFilter('sortBy', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="points">Points</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.sortOrder || 'desc'}
                    onValueChange={(value) => updateFilter('sortOrder', value as 'asc' | 'desc')}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest first</SelectItem>
                      <SelectItem value="asc">Oldest first</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {activeFilterCount > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">Active filters:</span>
                  <div className="flex flex-wrap gap-1">
                    {filters.dateFrom && (
                      <Badge variant="secondary" className="text-xs">
                        From: {new Date(filters.dateFrom).toLocaleDateString()}
                      </Badge>
                    )}
                    {filters.dateTo && (
                      <Badge variant="secondary" className="text-xs">
                        To: {new Date(filters.dateTo).toLocaleDateString()}
                      </Badge>
                    )}
                    {filters.minPoints && (
                      <Badge variant="secondary" className="text-xs">
                        Min: {filters.minPoints} pts
                      </Badge>
                    )}
                    {filters.maxPoints && (
                      <Badge variant="secondary" className="text-xs">
                        Max: {filters.maxPoints} pts
                      </Badge>
                    )}
                    {filters.accounts && filters.accounts.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Account: {accounts.find(a => a.id === filters.accounts?.[0])?.name}
                      </Badge>
                    )}
                    {filters.status && (
                      <Badge variant="secondary" className="text-xs">
                        Status: {filters.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}