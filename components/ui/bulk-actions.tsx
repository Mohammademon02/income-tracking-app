"use client"

import { useState } from "react"
import { Trash2, Download, Archive, MoreHorizontal, CheckSquare, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface BulkActionsProps<T> {
  items: T[]
  selectedItems: Set<string>
  onSelectionChange: (selectedIds: Set<string>) => void
  onBulkDelete?: (selectedIds: string[]) => Promise<void>
  onBulkExport?: (selectedIds: string[]) => Promise<void>
  onBulkArchive?: (selectedIds: string[]) => Promise<void>
  getItemId: (item: T) => string
  getItemName?: (item: T) => string
  className?: string
}

export function BulkActions<T>({
  items,
  selectedItems,
  onSelectionChange,
  onBulkDelete,
  onBulkExport,
  onBulkArchive,
  getItemId,
  getItemName,
  className
}: BulkActionsProps<T>) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const selectedCount = selectedItems.size
  const allSelected = items.length > 0 && selectedItems.size === items.length
  const someSelected = selectedItems.size > 0 && selectedItems.size < items.length

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(items.map(getItemId)))
    }
  }

  const handleBulkAction = async (action: () => Promise<void>) => {
    setLoading(true)
    try {
      await action()
      onSelectionChange(new Set()) // Clear selection after action
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (onBulkDelete) {
      await handleBulkAction(() => onBulkDelete(Array.from(selectedItems)))
    }
    setShowDeleteDialog(false)
  }

  if (items.length === 0) return null

  return (
    <>
      <div className={cn("flex items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm", className)}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="p-1 h-8 w-8"
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4 text-blue-600" />
            ) : someSelected ? (
              <div className="h-4 w-4 bg-blue-600 rounded-sm flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-sm" />
              </div>
            ) : (
              <Square className="h-4 w-4 text-slate-400" />
            )}
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">
              {selectedCount > 0 ? (
                <>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {selectedCount}
                  </Badge>
                  <span className="ml-2">
                    {selectedCount === 1 ? 'item' : 'items'} selected
                  </span>
                </>
              ) : (
                `Select items (${items.length} total)`
              )}
            </span>
          </div>
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            {onBulkExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction(() => onBulkExport!(Array.from(selectedItems)))}
                disabled={loading}
                className="hover:bg-green-50 hover:border-green-200"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={loading}>
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onBulkArchive && (
                  <DropdownMenuItem
                    onClick={() => handleBulkAction(() => onBulkArchive!(Array.from(selectedItems)))}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Selected
                  </DropdownMenuItem>
                )}
                
                {onBulkDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} {selectedCount === 1 ? 'item' : 'items'}? 
              This action cannot be undone.
              
              {getItemName && selectedCount <= 5 && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  <div className="text-sm font-medium text-slate-700 mb-2">Items to be deleted:</div>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {Array.from(selectedItems).slice(0, 5).map(id => {
                      const item = items.find(item => getItemId(item) === id)
                      return item ? (
                        <li key={id} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          {getItemName(item)}
                        </li>
                      ) : null
                    })}
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Deleting..." : `Delete ${selectedCount} ${selectedCount === 1 ? 'Item' : 'Items'}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Checkbox component for individual items
interface SelectableItemProps {
  id: string
  selected: boolean
  onSelectionChange: (id: string, selected: boolean) => void
  className?: string
}

export function SelectableItem({ id, selected, onSelectionChange, className }: SelectableItemProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSelectionChange(id, !selected)}
      className={cn("p-1 h-8 w-8", className)}
    >
      {selected ? (
        <CheckSquare className="h-4 w-4 text-blue-600" />
      ) : (
        <Square className="h-4 w-4 text-slate-400 hover:text-slate-600" />
      )}
    </Button>
  )
}