"use client"

import { toast } from "sonner"
import { CheckCircle, XCircle, AlertCircle, Info, Loader2, Plus, Minus, TrendingUp, TrendingDown } from "lucide-react"

interface ToastOptions {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export const enhancedToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-white" />
      </div>,
      unstyled: true,
      className: "bg-white border-l-4 border-l-green-500 border border-green-100 rounded-lg shadow-lg p-4 flex items-center gap-3 min-h-[64px]",
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  // New: Specific variant for adding entries/points
  add: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
        <Plus className="w-4 h-4 text-white font-bold" />
      </div>,
      unstyled: true,
      className: "bg-white border-l-4 border-l-green-500 border border-green-100 rounded-lg shadow-lg p-4 flex items-center gap-3 min-h-[64px]",
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  // New: Specific variant for removing/withdrawing
  remove: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
        <Minus className="w-4 h-4 text-white font-bold" />
      </div>,
      unstyled: true,
      className: "bg-white border-l-4 border-l-orange-500 border border-orange-100 rounded-lg shadow-lg p-4 flex items-center gap-3 min-h-[64px]",
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  // New: Earnings/income specific
  earnings: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
        <TrendingUp className="w-4 h-4 text-white font-bold" />
      </div>,
      unstyled: true,
      className: "bg-white border-l-4 border-l-emerald-500 border border-emerald-100 rounded-lg shadow-lg p-4 flex items-center gap-3 min-h-[64px]",
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  // New: Withdrawal/spending specific
  withdrawal: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
        <TrendingDown className="w-4 h-4 text-white font-bold" />
      </div>,
      unstyled: true,
      className: "bg-white border-l-4 border-l-blue-500 border border-blue-100 rounded-lg shadow-lg p-4 flex items-center gap-3 min-h-[64px]",
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      description: options?.description,
      duration: options?.duration || 6000,
      icon: <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
        <XCircle className="w-4 h-4 text-white" />
      </div>,
      unstyled: true,
      className: "bg-white border-l-4 border-l-red-500 border border-red-100 rounded-lg shadow-lg p-4 flex items-center gap-3 min-h-[64px]",
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  warning: (message: string, options?: ToastOptions) => {
    return toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      icon: <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
        <AlertCircle className="w-4 h-4 text-white" />
      </div>,
      unstyled: true,
      className: "bg-white border-l-4 border-l-amber-500 border border-amber-100 rounded-lg shadow-lg p-4 flex items-center gap-3 min-h-[64px]",
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  info: (message: string, options?: ToastOptions) => {
    return toast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
        <Info className="w-4 h-4 text-white" />
      </div>,
      unstyled: true,
      className: "bg-white border-l-4 border-l-blue-500 border border-blue-100 rounded-lg shadow-lg p-4 flex items-center gap-3 min-h-[64px]",
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      description: options?.description,
      icon: <div className="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center">
        <Loader2 className="w-4 h-4 text-white animate-spin" />
      </div>,
      unstyled: true,
      className: "bg-white border-l-4 border-l-slate-500 border border-slate-100 rounded-lg shadow-lg p-4 flex items-center gap-3 min-h-[64px]",
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success: typeof success === 'function' ? success : () => success,
      error: typeof error === 'function' ? error : () => error,
    })
  },
}

// Predefined toast messages for common actions
export const commonToasts = {
  // Account actions
  accountCreated: () => enhancedToast.add("Account created successfully!", {
    description: "You can now start adding entries for this account"
  }),
  
  accountUpdated: () => enhancedToast.success("Account updated!", {
    description: "Changes have been saved"
  }),
  
  accountDeleted: (name: string) => enhancedToast.remove("Account deleted", {
    description: `"${name}" and all associated data have been removed`
  }),

  // Entry actions - using specific add variant
  entryAdded: (points: number) => enhancedToast.add("Entry added!", {
    description: `+${points.toLocaleString()} points recorded successfully`
  }),
  
  entryUpdated: () => enhancedToast.success("Entry updated!", {
    description: "Changes have been saved"
  }),
  
  entryDeleted: () => enhancedToast.remove("Entry deleted", {
    description: "The entry has been removed"
  }),

  // Withdrawal actions - using specific withdrawal variant
  withdrawalRequested: (amount: number) => enhancedToast.withdrawal("Withdrawal requested!", {
    description: `$${amount.toFixed(2)} withdrawal has been submitted for processing`
  }),
  
  withdrawalUpdated: () => enhancedToast.success("Withdrawal updated!", {
    description: "Status has been changed"
  }),
  
  withdrawalDeleted: () => enhancedToast.remove("Withdrawal deleted", {
    description: "The withdrawal request has been removed"
  }),

  // Earnings specific
  pointsEarned: (points: number, account: string) => enhancedToast.earnings("Points earned!", {
    description: `+${points.toLocaleString()} points added to ${account}`
  }),

  // Error messages
  networkError: () => enhancedToast.error("Connection failed", {
    description: "Please check your internet connection and try again",
    action: {
      label: "Retry",
      onClick: () => window.location.reload()
    }
  }),
  
  validationError: (field: string) => enhancedToast.error("Invalid input", {
    description: `Please check the ${field} field and try again`
  }),
  
  serverError: () => enhancedToast.error("Server error", {
    description: "Something went wrong on our end. Please try again later",
    action: {
      label: "Report",
      onClick: () => window.open('mailto:support@example.com', '_blank')
    }
  }),

  // Warning messages
  unsavedChanges: () => enhancedToast.warning("Unsaved changes", {
    description: "You have unsaved changes that will be lost"
  }),
  
  lowBalance: (balance: number) => enhancedToast.warning("Low balance", {
    description: `Current balance: ${balance.toLocaleString()} points`
  }),

  // Info messages
  dataExported: (format: string) => enhancedToast.info("Data exported", {
    description: `Your data has been exported as ${format.toUpperCase()}`
  }),
  
  featureComingSoon: () => enhancedToast.info("Coming soon!", {
    description: "This feature is currently in development"
  }),
}