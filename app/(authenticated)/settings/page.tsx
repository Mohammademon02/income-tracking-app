import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthlyTargetSettings } from "@/components/monthly-target-settings"
import { Settings, Target, Bell, User } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-8 bg-linear-to-br from-slate-50/50 to-blue-50/30 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-slate-600 mt-1">Customize your Survey Tracker experience</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <Settings className="w-4 h-4" />
          <span>Preferences</span>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Target Settings */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Monthly Target
            </CardTitle>
            <CardDescription>
              Set your monthly earning goals and track progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyTargetSettings />
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure when and how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Withdrawal Updates</p>
                <p className="text-sm text-slate-500">Get notified when withdrawals are approved</p>
              </div>
              <div className="w-10 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-all"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Daily Goal Reminders</p>
                <p className="text-sm text-slate-500">Remind me about daily earning goals</p>
              </div>
              <div className="w-10 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-all"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Milestone Celebrations</p>
                <p className="text-sm text-slate-500">Celebrate when you reach point milestones</p>
              </div>
              <div className="w-10 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-all"></div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <a 
                href="/settings/notifications" 
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Settings className="w-4 h-4" />
                Advanced Notification Settings
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              Profile
            </CardTitle>
            <CardDescription>
              Manage your account preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your display name"
                defaultValue="Survey Tracker User"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Timezone
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>UTC+06:00 (Dhaka)</option>
                <option>UTC+05:30 (Kolkata)</option>
                <option>UTC+00:00 (London)</option>
                <option>UTC-05:00 (New York)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-600" />
              Data & Privacy
            </CardTitle>
            <CardDescription>
              Manage your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <p className="font-medium text-slate-800">Export Data</p>
              <p className="text-sm text-slate-500">Download all your survey data</p>
            </button>
            
            <button className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <p className="font-medium text-slate-800">Clear Cache</p>
              <p className="text-sm text-slate-500">Clear stored preferences and cache</p>
            </button>
            
            <button className="w-full text-left p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-red-500">Permanently delete your account and data</p>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}