"use client"

import { useState } from "react"
import { MoreHorizontal, ChevronRight, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MobileTableProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  onItemClick?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  className?: string
  emptyState?: React.ReactNode
}

export function MobileTable<T>({
  items,
  renderItem,
  onItemClick,
  onEdit,
  onDelete,
  className,
  emptyState
}: MobileTableProps<T>) {
  if (items.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => (
        <MobileTableItem
          key={index}
          item={item}
          index={index}
          renderItem={renderItem}
          onItemClick={onItemClick}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

interface MobileTableItemProps<T> {
  item: T
  index: number
  renderItem: (item: T, index: number) => React.ReactNode
  onItemClick?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
}

function MobileTableItem<T>({
  item,
  index,
  renderItem,
  onItemClick,
  onEdit,
  onDelete
}: MobileTableItemProps<T>) {
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = () => setIsPressed(true)
  const handleTouchEnd = () => setIsPressed(false)
  const handleMouseDown = () => setIsPressed(true)
  const handleMouseUp = () => setIsPressed(false)
  const handleMouseLeave = () => setIsPressed(false)

  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-lg p-4 transition-all duration-200",
        "hover:shadow-md hover:border-slate-300",
        "active:scale-[0.98] active:shadow-sm",
        isPressed && "scale-[0.98] shadow-sm",
        onItemClick && "cursor-pointer"
      )}
      onClick={() => onItemClick?.(item)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {renderItem(item, index)}
        </div>
        
        {(onEdit || onDelete) && (
          <div className="ml-3 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(item)
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(item)
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        {onItemClick && !onEdit && !onDelete && (
          <ChevronRight className="h-4 w-4 text-slate-400 ml-2 flex-shrink-0" />
        )}
      </div>
    </div>
  )
}

// Specialized mobile components for different data types
interface MobileAccountCardProps {
  account: {
    id: string
    name: string
    color: string
    totalPoints: number
    currentBalance: number
    completedWithdrawals: number
    pendingWithdrawals: number
  }
  onEdit?: (account: any) => void
  onDelete?: (account: any) => void
  onClick?: (account: any) => void
}

export function MobileAccountCard({ account, onEdit, onDelete, onClick }: MobileAccountCardProps) {
  return (
    <MobileTable
      items={[account]}
      renderItem={(acc) => (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
              {acc.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 truncate">{acc.name}</h3>
              <p className="text-sm text-slate-500">
                {acc.totalPoints.toLocaleString()} total points
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="font-semibold text-blue-600">
                {acc.currentBalance.toLocaleString()}
              </div>
              <div className="text-blue-500 text-xs">Available Balance</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="font-semibold text-green-600">
                ${acc.completedWithdrawals.toFixed(2)}
              </div>
              <div className="text-green-500 text-xs">Completed</div>
            </div>
          </div>
          
          {acc.pendingWithdrawals > 0 && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
              ${acc.pendingWithdrawals.toFixed(2)} pending
            </Badge>
          )}
        </div>
      )}
      onItemClick={onClick}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}

interface MobileEntryCardProps {
  entry: {
    id: string
    date: Date
    points: number
    accountName: string
    accountColor: string
  }
  onEdit?: (entry: any) => void
  onDelete?: (entry: any) => void
  onClick?: (entry: any) => void
}

export function MobileEntryCard({ entry, onEdit, onDelete, onClick }: MobileEntryCardProps) {
  return (
    <MobileTable
      items={[entry]}
      renderItem={(ent) => (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                {ent.accountName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{ent.accountName}</h3>
                <p className="text-sm text-slate-500">
                  {new Date(ent.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-600">
                +{ent.points.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">
                ${(ent.points / 100).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
      onItemClick={onClick}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}