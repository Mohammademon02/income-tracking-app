"use client";

import { enhancedToast, commonToasts } from "@/components/ui/enhanced-toast";

export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading";

export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private activeNotifications = new Map<string, string>();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Core notification methods
  success(message: string, options?: NotificationOptions) {
    return enhancedToast.success(message, options);
  }

  error(message: string, options?: NotificationOptions) {
    return enhancedToast.error(message, {
      ...options,
      duration: options?.persistent ? 0 : options?.duration || 6000,
    });
  }

  warning(message: string, options?: NotificationOptions) {
    return enhancedToast.warning(message, options);
  }

  info(message: string, options?: NotificationOptions) {
    return enhancedToast.info(message, options);
  }

  loading(message: string, options?: NotificationOptions) {
    const id = enhancedToast.loading(message, options);
    return id;
  }

  // Promise-based notifications
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
  ) {
    return enhancedToast.promise(promise, messages);
  }

  // Application-specific notifications
  withdrawal = {
    requested: (amount: number, accountName: string) =>
      this.success(`Withdrawal requested!`, {
        description: `$${amount.toFixed(2)} withdrawal from ${accountName} is being processed`,
        duration: 5000,
      }),

    approved: (amount: number, accountName: string, processingDays: number) =>
      this.success(`Withdrawal approved! 🎉`, {
        description: `$${amount.toFixed(2)} from ${accountName} processed in ${processingDays} business days`,
        duration: 6000,
      }),

    delayed: (amount: number, accountName: string, daysPending: number) =>
      this.warning(`Withdrawal delayed`, {
        description: `$${amount.toFixed(2)} from ${accountName} has been pending for ${daysPending} business days`,
        action: {
          label: "Contact Support",
          onClick: () => window.open("mailto:support@example.com", "_blank"),
        },
      }),

    failed: (amount: number, accountName: string, reason?: string) =>
      this.error(`Withdrawal failed`, {
        description: `$${amount.toFixed(2)} from ${accountName}${reason ? `: ${reason}` : ""}`,
        action: {
          label: "Retry",
          onClick: () => window.location.reload(),
        },
      }),
  };

  account = {
    created: (name: string) =>
      this.success(`Account "${name}" created!`, {
        description: "You can now start tracking entries for this account",
      }),

    updated: (name: string) => this.success(`Account "${name}" updated!`),

    deleted: (name: string) =>
      this.success(`Account "${name}" deleted`, {
        description: "All associated data has been removed",
      }),

    balanceThreshold: (name: string, balance: number, threshold: number) =>
      this.info(`${name} ready for withdrawal!`, {
        description: `Balance: ${balance.toLocaleString()} pts (${threshold.toLocaleString()} pts minimum reached)`,
        action: {
          label: "Request Withdrawal",
          onClick: () => (window.location.href = "/withdrawals"),
        },
      }),
  };

  entry = {
    added: (points: number, accountName: string) =>
      this.success(`Entry added to ${accountName}!`, {
        description: `+${points.toLocaleString()} points ($${(points / 100).toFixed(2)})`,
      }),

    milestone: (totalPoints: number, milestone: number) =>
      this.success(`Milestone reached! 🎯`, {
        description: `You've earned ${totalPoints.toLocaleString()} points total! Next milestone: ${milestone.toLocaleString()} pts`,
      }),

    dailyGoal: (todayPoints: number, goalPoints: number) =>
      this.success(`Daily goal achieved! 🌟`, {
        description: `${todayPoints.toLocaleString()} / ${goalPoints.toLocaleString()} points earned today`,
      }),
  };

  system = {
    dataExported: (format: string, recordCount: number) =>
      this.info(`Data exported successfully`, {
        description: `${recordCount} records exported as ${format.toUpperCase()}`,
      }),

    dataImported: (recordCount: number) =>
      this.success(`Data imported successfully`, {
        description: `${recordCount} records have been imported`,
      }),

    backupCreated: () =>
      this.success(`Backup created`, {
        description: "Your data has been safely backed up",
      }),

    updateAvailable: (version: string) =>
      this.info(`Update available`, {
        description: `Version ${version} is now available`,
        action: {
          label: "Update Now",
          onClick: () => window.location.reload(),
        },
      }),
  };

  // Batch notifications for multiple operations
  batch = {
    entriesImported: (successCount: number, errorCount: number) => {
      if (errorCount === 0) {
        return this.success(`All entries imported!`, {
          description: `${successCount} entries added successfully`,
        });
      } else {
        return this.warning(`Import completed with issues`, {
          description: `${successCount} successful, ${errorCount} failed`,
          action: {
            label: "View Details",
            onClick: () => console.log("Show import details"),
          },
        });
      }
    },

    withdrawalsProcessed: (approvedCount: number, rejectedCount: number) => {
      if (rejectedCount === 0) {
        return this.success(`All withdrawals approved!`, {
          description: `${approvedCount} withdrawal requests have been processed`,
        });
      } else {
        return this.warning(`Withdrawals processed`, {
          description: `${approvedCount} approved, ${rejectedCount} rejected`,
        });
      }
    },
  };
}

export const notifications = NotificationService.getInstance();
