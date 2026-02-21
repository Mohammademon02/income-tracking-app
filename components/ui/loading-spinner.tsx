import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-blue-600", sizeClasses[size])} />
      {text && (
        <span className="text-sm text-slate-600 font-medium">{text}</span>
      )}
    </div>
  )
}

interface LoadingStateProps {
  children?: React.ReactNode
  className?: string
}

export function LoadingState({ children, className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      {children || (
        <>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Loading...</h3>
          <p className="text-slate-500 text-center max-w-sm">
            Please wait while we fetch your data
          </p>
        </>
      )}
    </div>
  )
}

export function TableLoadingState() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="p-8">
        <LoadingState>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Loading data...</h3>
          <p className="text-slate-500 text-center">
            Fetching your records from the database
          </p>
        </LoadingState>
      </div>
    </div>
  )
}

export function PageLoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <LoadingState>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Loading page...</h2>
        <p className="text-slate-500 text-center">
          Setting up your dashboard
        </p>
      </LoadingState>
    </div>
  )
}