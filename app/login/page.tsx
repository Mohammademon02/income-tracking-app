"use client"

import { useState } from "react"
import Image from "next/image"
import { Eye, EyeOff, Loader2, LineChart, ShieldCheck, Wallet } from "lucide-react"

import { login } from "@/app/actions/auth"
import { Reveal } from "@/components/motion/reveal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * The three blurred gradient orbs and two pulsing background icons that used to
 * sit behind this card are gone; they were decoration on a form with two
 * fields. What replaced them is the app's own ambient light plus a panel saying
 * what the thing is — the only screen a person sees before deciding to sign in
 * had previously been a logo and two inputs floating on grey.
 *
 * The panel is hidden below `lg`, where the form is the entire job.
 */

const FEATURES = [
  {
    icon: LineChart,
    title: "Every account, one total",
    body: "Points and dollars across all your survey accounts, reconciled daily.",
    chip: "bg-primary/12 text-primary",
  },
  {
    icon: Wallet,
    title: "Withdrawals you can chase",
    body: "See what is pending, what cleared, and how long each payout actually took.",
    chip: "bg-chart-2/12 text-chart-2",
  },
  {
    icon: ShieldCheck,
    title: "Yours, on your device",
    body: "Installable as an app, and it keeps working when the connection does not.",
    chip: "bg-chart-4/12 text-chart-4",
  },
]

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
    <div className="relative min-h-screen bg-background">
      <div className="aurora" aria-hidden="true">
        <span />
      </div>

      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-4 py-10 lg:grid-cols-2 lg:gap-16">
        {/* Brand panel */}
        <Reveal className="hidden lg:block">
          <div className="space-y-10">
            <Image
              src="/Logo.png"
              alt="SurvTrack"
              width={200}
              height={60}
              className="h-11 w-auto dark:brightness-0 dark:invert"
              priority
            />

            <div className="space-y-3">
              <h1 className="max-w-md text-4xl leading-[1.1] font-semibold tracking-tight">
                Know what your surveys{" "}
                <span className="text-gradient">actually paid</span>.
              </h1>
              <p className="max-w-md text-muted-foreground">
                Track points, balances and payouts across every account, without a spreadsheet
                that disagrees with itself.
              </p>
            </div>

            <ul className="space-y-5">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="flex gap-4">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${feature.chip}`}
                  >
                    <feature.icon className="size-4" />
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{feature.title}</p>
                    <p className="max-w-sm text-sm text-muted-foreground">{feature.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Form */}
        <Reveal delay={0.12} className="mx-auto w-full max-w-sm">
          <Card className="w-full">
            <CardHeader className="space-y-4 text-center">
              {/* Repeated here because the brand panel beside it is not
                  rendered below `lg`, where this is the only mark on screen. */}
              <Image
                src="/Logo.png"
                alt="SurvTrack"
                width={200}
                height={60}
                className="mx-auto h-12 w-auto lg:hidden dark:brightness-0 dark:invert"
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
                      className="absolute top-0 right-0 flex h-9 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {error ? (
                  <p
                    role="alert"
                    className="rounded-lg bg-destructive/12 px-3 py-2 text-sm text-destructive"
                  >
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
        </Reveal>
      </div>
    </div>
  )
}
