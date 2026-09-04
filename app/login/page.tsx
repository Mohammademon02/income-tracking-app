"use client"

import { useState } from "react"
import Image from "next/image"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { login } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    // On success this redirects, so `loading` is only reset on failure.
    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    // The three blurred gradient orbs and two pulsing background icons that
    // used to sit behind this card are gone; they were decoration on a form
    // with two fields.
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-4 text-center">
          <Image
            src="/Logo.png"
            alt="SurvTrack"
            width={200}
            height={60}
            className="mx-auto h-12 w-auto dark:brightness-0 dark:invert"
            priority
          />
          <CardDescription>Sign in to manage your survey income.</CardDescription>
        </CardHeader>

        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0 flex h-9 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <p role="alert" className="rounded-md bg-destructive-muted px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
