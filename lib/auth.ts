import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const secretKey = new TextEncoder().encode(
  process.env.APP_PASSWORD || "fallback-secret-key-change-me"
)

export async function createSession(username: string) {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secretKey)

  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function verifySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as { username: string }
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}

export function validateCredentials(username: string, password: string) {
  const validUsername = process.env.APP_USERNAME
  const validPassword = process.env.APP_PASSWORD

  return username === validUsername && password === validPassword
}
