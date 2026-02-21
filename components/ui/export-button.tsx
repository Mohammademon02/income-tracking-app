"use client"

import { useState } from "react"
import { Download, FileText, Database, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { enhancedToast, commonToasts } from "@/components/ui/enhanced-toast"
import { 
  exportToCSV, 
  exportToJSON, 
  formatAccountsForExport, 
  formatEntriesForExport, 
  formatWithdrawalsForExport,
  exportComprehensiveReport
} from "@/lib/export-utils"

interface ExportButtonProps {
  data: any[]
  type: 'accounts' | 'entries' | 'withdrawals' | 'comprehensive'
  filename?: string
  className?: string
  accounts?: any[]
  entries?: any[]
  withdrawals?: any[]
}

export function ExportButton({ 
  data, 
  type, 
  filename, 
  className,
  accounts = [],
  entries = [],
  withdrawals = []
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const getFormattedData = () => {
    switch (type) {
      case 'accounts':
        return formatAccountsForExport(data)
      case 'entries':
        return formatEntriesForExport(data)
      case 'withdrawals':
        return formatWithdrawalsForExport(data)
      default:
        return data
    }
  }

  const getDefaultFilename = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    return filename || `${type}-${timestamp}`
  }

  const handleExport = async (format: 'csv' | 'json' | 'comprehensive') => {
    if (data.length === 0 && type !== 'comprehensive') {
      enhancedToast.warning("No data to export", {
        description: "There are no records to export"
      })
      return
    }

    setLoading(true)
    
    try {
      const exportFilename = getDefaultFilename()
      
      if (format === 'comprehensive') {
        exportComprehensiveReport(accounts, entries, withdrawals)
        commonToasts.dataExported('comprehensive report')
      } else {
        const formattedData = getFormattedData()
        
        if (format === 'csv') {
          exportToCSV(formattedData, exportFilename)
          commonToasts.dataExported('CSV')
        } else if (format === 'json') {
          exportToJSON(formattedData, exportFilename)
          commonToasts.dataExported('JSON')
        }
      }
    } catch (error) {
      enhancedToast.error("Export failed", {
        description: "There was an error exporting your data. Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  const getButtonText = () => {
    if (type === 'comprehensive') return 'Export Report'
    return `Export ${type.charAt(0).toUpperCase() + type.slice(1)}`
  }

  const getRecordCount = () => {
    if (type === 'comprehensive') {
      return accounts.length + entries.length + withdrawals.length
    }
    return data.length
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`hover:bg-green-50 hover:border-green-200 transition-colors ${className}`}
          disabled={loading}
        >
          <Download className="w-4 h-4 mr-2" />
          {loading ? "Exporting..." : getButtonText()}
          {!loading && (
            <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {getRecordCount()}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-slate-700 border-b border-slate-100">
          Export Options
        </div>
        
        {type !== 'comprehensive' && (
          <>
            <DropdownMenuItem 
              onClick={() => handleExport('csv')}
              className="cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
              <div>
                <div className="font-medium">CSV Format</div>
                <div className="text-xs text-slate-500">Excel compatible</div>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleExport('json')}
              className="cursor-pointer"
            >
              <Database className="w-4 h-4 mr-2 text-blue-600" />
              <div>
                <div className="font-medium">JSON Format</div>
                <div className="text-xs text-slate-500">Developer friendly</div>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
          </>
        )}
        
        {(type === 'comprehensive' || (accounts.length > 0 && entries.length > 0)) && (
          <DropdownMenuItem 
            onClick={() => handleExport('comprehensive')}
            className="cursor-pointer"
          >
            <FileText className="w-4 h-4 mr-2 text-purple-600" />
            <div>
              <div className="font-medium">Full Report</div>
              <div className="text-xs text-slate-500">
                All data + summary
              </div>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}