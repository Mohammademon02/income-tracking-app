"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "@/app/actions/auth"
import { Eye, EyeOff, TrendingUp, BarChart3 } from "lucide-react"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-slate-100/40 to-gray-100/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-full blur-3xl"></div>
        
        {/* Minimal floating icons */}
        <div className="absolute top-1/4 right-1/4 opacity-5">
          <TrendingUp className="w-24 h-24 text-indigo-600 animate-pulse" style={{ animationDuration: '4s' }} />
        </div>
        <div className="absolute bottom-1/4 left-1/4 opacity-5">
          <BarChart3 className="w-20 h-20 text-slate-600 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        </div>
      </div>

      {/* Clean Modern Card */}
      <Card className="w-full max-w-md relative z-10 bg-white/90 backdrop-blur-sm border border-white/60 shadow-xl shadow-indigo-100/50">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800">
            Survey Tracker
          </CardTitle>
          <CardDescription className="text-slate-600 text-base">
            Sign in to manage your survey income
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 font-medium">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200 h-12"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200 h-12 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold h-12 rounded-xl shadow-lg shadow-indigo-200/50 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-300/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center justify-center space-x-4 text-slate-500 text-sm">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Secure</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Fast</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <span>Reliable</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
