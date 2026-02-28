"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Bell,
    BellRing,
    CheckCircle,
    X,
    Settings,
    Loader2,
    Bug
} from 'lucide-react'
import { useSimpleNotifications } from '@/hooks/use-simple-notifications'
import { useSettings } from '@/hooks/use-settings'
import { simpleNotificationManager } from '@/lib/simple-notifications'
import Link from 'next/link'

export function UnifiedNotificationSetup() {
    const { supported, permission, active, enable, loading } = useSimpleNotifications()
    const { settings } = useSettings()
    const [dismissed, setDismissed] = useState(false)

    // Don't show if not supported, already active, or dismissed
    if (!supported || active || dismissed || permission === 'denied') {
        return null
    }

    // Don't show if notifications are disabled in settings
    if (!settings?.notificationsEnabled || !settings?.pushNotifications) {
        return null
    }

    const handleEnable = async () => {
        const success = await enable()
        if (success) {
            setDismissed(true)
        }
    }

    const handleDebug = () => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Debug Status:')
            simpleNotificationManager.debugStatus()
        }
    }

    return (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <BellRing className="w-5 h-5 text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-blue-900 mb-1">
                            Enable Hourly Income Notifications
                        </h3>
                        <p className="text-sm text-blue-700 mb-3">
                            Get your daily income summary every hour. Works perfectly in Chrome and other modern browsers.
                        </p>

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                onClick={handleEnable}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                    <Bell className="w-4 h-4 mr-1" />
                                )}
                                {loading ? 'Enabling...' : 'Enable Now'}
                            </Button>

                            <Link href="/settings/notifications">
                                <Button variant="outline" size="sm">
                                    <Settings className="w-4 h-4 mr-1" />
                                    Settings
                                </Button>
                            </Link>
                            
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={handleDebug}
                                className="text-slate-500 hover:text-slate-700"
                            >
                                <Bug className="w-4 h-4 mr-1" />
                                Debug
                            </Button>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-600"
                        onClick={() => setDismissed(true)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}