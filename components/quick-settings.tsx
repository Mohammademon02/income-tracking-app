"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Target,
    Settings,
    Save,
    DollarSign
} from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import Link from "next/link"

export function QuickSettings() {
    const { settings, loading, updateSettings, getDailyGoal } = useSettings()
    const [tempGoal, setTempGoal] = useState<number>(0)
    const [saving, setSaving] = useState(false)

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-slate-200 rounded w-full"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const currentGoal = getDailyGoal()
    const displayGoal = tempGoal || currentGoal

    const handleQuickSave = async (points: number) => {
        setSaving(true)
        const success = await updateSettings({ dailyGoalPoints: points })
        if (success) {
            setTempGoal(0)
        }
        setSaving(false)
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Daily Goal
                    <Badge variant="secondary" className="ml-auto">
                        ${(displayGoal / 100).toFixed(2)}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Goal Display */}
                <div className="text-center p-4 bg-linear-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-800">
                        {displayGoal.toLocaleString()} points
                    </div>
                    <div className="text-sm text-slate-600">
                        ${(displayGoal / 100).toFixed(2)} per day
                    </div>
                </div>

                {/* Quick Goal Input */}
                <div className="space-y-2">
                    <Label htmlFor="quickGoal" className="text-sm">Set New Goal</Label>
                    <div className="flex gap-2">
                        <Input
                            id="quickGoal"
                            type="number"
                            min="100"
                            max="50000"
                            step="100"
                            placeholder={currentGoal.toString()}
                            value={tempGoal || ''}
                            onChange={(e) => setTempGoal(parseInt(e.target.value) || 0)}
                            className="flex-1"
                        />
                        <Button
                            size="sm"
                            onClick={() => handleQuickSave(tempGoal)}
                            disabled={!tempGoal || tempGoal === currentGoal || saving}
                        >
                            <Save className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { label: '$10', points: 1000 },
                        { label: '$20', points: 2000 },
                        { label: '$30', points: 3000 },
                        { label: '$50', points: 5000 }
                    ].map((preset) => (
                        <Button
                            key={preset.points}
                            variant={currentGoal === preset.points ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleQuickSave(preset.points)}
                            disabled={saving}
                            className="flex items-center gap-1"
                        >
                            <DollarSign className="w-3 h-3" />
                            {preset.label}
                        </Button>
                    ))}
                </div>

                {/* Full Settings Link */}
                <Link href="/settings/notifications">
                    <Button variant="ghost" size="sm" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        More Settings
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}