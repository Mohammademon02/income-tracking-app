"use client"

import { useState } from "react"
import { Database, Download, FileSpreadsheet, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { commonToasts, enhancedToast } from "@/components/ui/enhanced-toast"
import {
  exportComprehensiveReport,
  exportToCSV,
  exportToJSON,
  formatAccountsForExport,
  formatEntriesForExport,
  formatWithdrawalsForExport,
  type ExportableAccount,
  type ExportableEntry,
  type ExportableWithdrawal,
  type ExportRow,
} from "@/lib/export-utils"
import { todayKey } from "@/lib/date-utils"

/**
 * The prop shape is a union rather than `data: any[]` plus a `type` string,
 * because the two were never independent: passing entries with `type="accounts"`
 * type-checked and then exported a file of `undefined` columns.
 */
type ExportButtonProps = { filename?: string; className?: string } & (
  | { type: "accounts"; data: ExportableAccount[] }
  | { type: "entries"; data: ExportableEntry[] }
  | { type: "withdrawals"; data: ExportableWithdrawal[] }
  | {
      type: "comprehensive"
      accounts: ExportableAccount[]
      entries: ExportableEntry[]
      withdrawals: ExportableWithdrawal[]
    }
)

export function ExportButton(props: ExportButtonProps) {
  const { type, filename, className } = props
  const [loading, setLoading] = useState(false)

  const recordCount =
    props.type === "comprehensive"
      ? props.accounts.length + props.entries.length + props.withdrawals.length
      : props.data.length

  const formatRows = (): ExportRow[] => {
    switch (props.type) {
      case "accounts":
        return formatAccountsForExport(props.data)
      case "entries":
        return formatEntriesForExport(props.data)
      case "withdrawals":
        return formatWithdrawalsForExport(props.data)
      case "comprehensive":
        return []
    }
  }

  const handleExport = (format: "csv" | "json" | "comprehensive") => {
    if (recordCount === 0) {
      enhancedToast.warning("No data to export", {
        description: "There are no records to export",
      })
      return
    }

    setLoading(true)

    try {
      if (props.type === "comprehensive") {
        exportComprehensiveReport(props.accounts, props.entries, props.withdrawals)
        commonToasts.dataExported("comprehensive report")
        return
      }

      const rows = formatRows()
      const exportFilename = filename ?? `${type}-${todayKey()}`

      if (format === "csv") {
        exportToCSV(rows, exportFilename)
        commonToasts.dataExported("CSV")
      } else {
        exportToJSON(rows, exportFilename)
        commonToasts.dataExported("JSON")
      }
    } catch {
      enhancedToast.error("Export failed", {
        description: "There was an error exporting your data. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const buttonText =
    type === "comprehensive" ? "Export Report" : `Export ${type[0].toUpperCase()}${type.slice(1)}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`hover:bg-success-muted hover:border-success/30 transition-colors ${className ?? ""}`}
          disabled={loading}
        >
          <Download className="w-4 h-4 mr-2" />
          {loading ? "Exporting..." : buttonText}
          {!loading && (
            <span className="ml-2 text-xs bg-muted text-foreground px-2 py-0.5 rounded-full">
              {recordCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-foreground border-b border-border">
          Export Options
        </div>

        {type === "comprehensive" ? (
          <DropdownMenuItem onClick={() => handleExport("comprehensive")} className="cursor-pointer">
            <FileText className="w-4 h-4 mr-2 text-primary" />
            <div>
              <div className="font-medium">Full Report</div>
              <div className="text-xs text-muted-foreground">All data + summary</div>
            </div>
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={() => handleExport("csv")} className="cursor-pointer">
              <FileSpreadsheet className="w-4 h-4 mr-2 text-success" />
              <div>
                <div className="font-medium">CSV Format</div>
                <div className="text-xs text-muted-foreground">Excel compatible</div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleExport("json")} className="cursor-pointer">
              <Database className="w-4 h-4 mr-2 text-primary" />
              <div>
                <div className="font-medium">JSON Format</div>
                <div className="text-xs text-muted-foreground">Developer friendly</div>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
