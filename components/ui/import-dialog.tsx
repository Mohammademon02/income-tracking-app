"use client"

import { useState, useRef } from "react"
import { Upload, Download, FileText, AlertCircle, CheckCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"

import {
  importAccountRows,
  importEntryRows,
  importWithdrawalRows,
} from "@/app/actions/import"
import { enhancedToast } from "@/components/ui/enhanced-toast"
import {
  importAccounts,
  importEntries,
  importWithdrawals,
  validateCSVFile,
  readFileContent,
  CSV_TEMPLATES,
  type ImportResult,
  type ImportOptions
} from "@/lib/import-utils"

interface ImportDialogProps {
  type: 'accounts' | 'entries' | 'withdrawals'
  accounts?: any[]
  onImportComplete?: (data: any[]) => void
  className?: string
}

export function ImportDialog({ type, accounts = [], onImportComplete, className }: ImportDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [options, setOptions] = useState<ImportOptions>({
    skipDuplicates: true,
    validateData: true,
    dryRun: false
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    const validation = validateCSVFile(selectedFile)
    if (!validation.valid) {
      enhancedToast.error("Invalid file", {
        description: validation.error
      })
      return
    }

    setFile(selectedFile)
    setImportResult(null)
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setImportResult(null)

    try {
      const content = await readFileContent(file)
      let result: ImportResult

      switch (type) {
        case 'accounts':
          result = importAccounts(content, options)
          break
        case 'entries':
          result = importEntries(content, accounts, options)
          break
        case 'withdrawals':
          result = importWithdrawals(content, accounts, options)
          break
        default:
          throw new Error('Invalid import type')
      }

      setImportResult(result)

      if (!result.success || !result.data || options.dryRun) return

      // Parsing the file is not importing it. This step is what was missing:
      // the rows used to be handed to a callback that discarded them.
      const write =
        type === 'accounts'
          ? importAccountRows
          : type === 'entries'
            ? importEntryRows
            : importWithdrawalRows

      const outcome = await write(result.data)

      if (!outcome.success) {
        enhancedToast.error("Import failed", { description: outcome.error })
        return
      }

      enhancedToast.success("Import complete", {
        description: `${outcome.imported} ${type} added${outcome.skipped ? `, ${outcome.skipped} skipped` : ''}.`,
      })

      onImportComplete?.(result.data)
      setOpen(false)
      setFile(null)
      setImportResult(null)
      router.refresh()
    } catch (error) {
      enhancedToast.error("Import failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const template = CSV_TEMPLATES[type]
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${type}-template.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
    
    enhancedToast.success("Template downloaded", {
      description: `${type}-template.csv has been downloaded`
    })
  }

  const resetDialog = () => {
    setFile(null)
    setImportResult(null)
    setOptions({
      skipDuplicates: true,
      validateData: true,
      dryRun: false
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getTypeLabel = () => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) resetDialog()
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`hover:bg-primary/10 hover:border-primary/30 ${className}`}>
          <Upload className="w-4 h-4 mr-2" />
          Import {getTypeLabel()}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import {getTypeLabel()}</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import {type} data. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/30">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-primary">Need a template?</p>
                <p className="text-sm text-primary">Download the CSV template to see the required format</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <Label>Select CSV File</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              {file ? (
                <div className="space-y-2">
                  <CheckCircle className="w-8 h-8 text-success mx-auto" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-foreground">Click to select a CSV file</p>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Browse Files
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Import Options */}
          <div className="space-y-4">
            <Label>Import Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="validateData"
                  checked={options.validateData}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, validateData: !!checked }))
                  }
                />
                <Label htmlFor="validateData" className="text-sm">
                  Validate data (recommended)
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skipDuplicates"
                  checked={options.skipDuplicates}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, skipDuplicates: !!checked }))
                  }
                />
                <Label htmlFor="skipDuplicates" className="text-sm">
                  Skip duplicate entries
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dryRun"
                  checked={options.dryRun}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, dryRun: !!checked }))
                  }
                />
                <Label htmlFor="dryRun" className="text-sm">
                  Preview only (don&apos;t import)
                </Label>
              </div>
            </div>
          </div>

          {/* Import Progress */}
          {importing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">Processing import...</span>
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
                <span className="font-medium">
                  {importResult.success ? 'Import Successful' : 'Import Failed'}
                </span>
              </div>

              {importResult.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-foreground">{importResult.summary.total}</div>
                    <div className="text-xs text-muted-foreground">Total Rows</div>
                  </div>
                  <div className="text-center p-3 bg-success-muted rounded-lg">
                    <div className="text-lg font-bold text-success">{importResult.summary.imported}</div>
                    <div className="text-xs text-success">Imported</div>
                  </div>
                  <div className="text-center p-3 bg-warning-muted rounded-lg">
                    <div className="text-lg font-bold text-warning">{importResult.summary.skipped}</div>
                    <div className="text-xs text-warning">Skipped</div>
                  </div>
                  <div className="text-center p-3 bg-destructive-muted rounded-lg">
                    <div className="text-lg font-bold text-destructive">{importResult.summary.failed}</div>
                    <div className="text-xs text-destructive">Failed</div>
                  </div>
                </div>
              )}

              {importResult.warnings && importResult.warnings.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium text-warning">Warnings</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.warnings.map((warning, index) => (
                      <div key={index} className="text-xs text-warning bg-warning-muted p-2 rounded">
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">Errors</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-xs text-destructive bg-destructive-muted p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {importResult?.success && !options.dryRun ? 'Close' : 'Cancel'}
          </Button>
          {file && !importing && (!importResult || options.dryRun) && (
            <Button onClick={handleImport} disabled={importing}>
              {options.dryRun ? 'Preview Import' : `Import ${getTypeLabel()}`}
            </Button>
          )}
          {importResult?.success && options.dryRun && (
            <Button 
              onClick={() => {
                setOptions(prev => ({ ...prev, dryRun: false }))
                handleImport()
              }}
              className="bg-success hover:bg-green-700"
            >
              Confirm Import
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}