"use server"

import { createSession, deleteSession, validateCredentials } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!validateCredentials(username, password)) {
    return { error: "Invalid credentials" }
  }

  await createSession(username)
  redirect("/dashboard")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
