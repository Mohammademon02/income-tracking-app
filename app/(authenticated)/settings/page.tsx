import { Bell, Clock, Database, Target } from "lucide-react"

import { DataMaintenance } from "@/components/data-maintenance"
import { MonthlyTargetSettings } from "@/components/monthly-target-settings"
import { NotificationPreferences } from "@/components/notification-preferences"
import { PageContainer, PageHeader } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { APP_TIMEZONE } from "@/lib/date-utils"

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader title="Settings" description="Goals, notifications and local data." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-4 text-muted-foreground" />
              Monthly target
            </CardTitle>
            <CardDescription>Set the monthly goal your progress is measured against.</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyTargetSettings />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-4 text-muted-foreground" />
              Notifications
            </CardTitle>
            <CardDescription>Choose what you are told about, and where.</CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationPreferences />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              Business timezone
            </CardTitle>
            <CardDescription>
              Which calendar day earnings are filed against, and where each month begins.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-mono text-sm">{APP_TIMEZONE}</p>
            {/*
              Read-only on purpose. This is a deployment setting
              (NEXT_PUBLIC_APP_TIMEZONE), not a per-session preference: changing
              it reinterprets which day every existing entry belongs to, so it
              should not be a control anyone can flip by accident. The page used
              to show a timezone dropdown that was wired to nothing at all.
            */}
            <p className="text-sm text-muted-foreground">
              Set with the NEXT_PUBLIC_APP_TIMEZONE environment variable. Changing it
              re-dates existing records, so it is not editable here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-4 text-muted-foreground" />
              Local data
            </CardTitle>
            <CardDescription>Cached pages and preferences stored in this browser.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataMaintenance />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
