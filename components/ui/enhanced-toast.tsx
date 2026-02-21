"use client"

import { toast } from "sonner"
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from "lucide-react"

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
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      className: "border-green-200 bg-green-50",
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
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      className: "border-red-200 bg-red-50",
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
      icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
      className: "border-orange-200 bg-orange-50",
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
      icon: <Info className="w-5 h-5 text-blue-600" />,
      className: "border-blue-200 bg-blue-50",
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    })
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      description: options?.description,
      icon: <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />,
      className: "border-slate-200 bg-slate-50",
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
  accountCreated: () => enhancedToast.success("Account created successfully!", {
    description: "You can now start adding entries for this account"
  }),
  
  accountUpdated: () => enhancedToast.success("Account updated!", {
    description: "Changes have been saved"
  }),
  
  accountDeleted: (name: string) => enhancedToast.success("Account deleted", {
    description: `"${name}" and all associated data have been removed`
  }),

  // Entry actions
  entryAdded: (points: number) => enhancedToast.success("Entry added!", {
    description: `${points.toLocaleString()} points recorded successfully`
  }),
  
  entryUpdated: () => enhancedToast.success("Entry updated!", {
    description: "Changes have been saved"
  }),
  
  entryDeleted: () => enhancedToast.success("Entry deleted", {
    description: "The entry has been removed"
  }),

  // Withdrawal actions
  withdrawalRequested: (amount: number) => enhancedToast.success("Withdrawal requested!", {
    description: `$${amount.toFixed(2)} withdrawal has been submitted for processing`
  }),
  
  withdrawalUpdated: () => enhancedToast.success("Withdrawal updated!", {
    description: "Status has been changed"
  }),
  
  withdrawalDeleted: () => enhancedToast.success("Withdrawal deleted", {
    description: "The withdrawal request has been removed"
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