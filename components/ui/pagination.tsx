"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
    const getVisiblePages = () => {
        const delta = 1
        const range = []
        const rangeWithDots = []

        // Always show first page
        if (totalPages === 1) return [1]

        // Calculate range around current page
        const start = Math.max(2, currentPage - delta)
        const end = Math.min(totalPages - 1, currentPage + delta)

        for (let i = start; i <= end; i++) {
            range.push(i)
        }

        // Add first page
        rangeWithDots.push(1)

        // Add dots and range if needed
        if (start > 2) {
            rangeWithDots.push("...")
        }

        // Add middle range (excluding first page if it's already added)
        range.forEach(page => {
            if (page !== 1) {
                rangeWithDots.push(page)
            }
        })

        // Add dots and last page if needed
        if (end < totalPages - 1) {
            rangeWithDots.push("...")
        }

        // Add last page (if different from first)
        if (totalPages > 1) {
            rangeWithDots.push(totalPages)
        }

        return rangeWithDots
    }

    if (totalPages <= 1) return null

    return (
        <div className={cn("flex items-center justify-center", className)}>
            <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                {/* First page button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all duration-200"
                    title="First page"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous page button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all duration-200"
                    title="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1 mx-1">
                    {getVisiblePages().map((page, index) => (
                        <div key={index}>
                            {page === "..." ? (
                                <div className="flex h-8 w-8 items-center justify-center text-slate-400">
                                    <MoreHorizontal className="h-4 w-4" />
                                </div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onPageChange(page as number)}
                                    className={cn(
                                        "h-8 w-8 p-0 font-medium transition-all duration-200 rounded-md",
                                        currentPage === page
                                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                            : "hover:bg-blue-50 hover:text-blue-600 text-slate-700"
                                    )}
                                >
                                    {page}
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Next page button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all duration-200"
                    title="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last page button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all duration-200"
                    title="Last page"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}