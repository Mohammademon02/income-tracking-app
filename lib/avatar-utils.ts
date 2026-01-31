// Server-side utility for avatar colors
export function getAvatarGradient(color: string): string {
  const colorMap: Record<string, string> = {
    blue: "bg-gradient-to-br from-blue-500 to-indigo-600",
    green: "bg-gradient-to-br from-green-500 to-emerald-600",
    purple: "bg-gradient-to-br from-purple-500 to-indigo-600",
    pink: "bg-gradient-to-br from-pink-500 to-rose-600",
    orange: "bg-gradient-to-br from-orange-500 to-red-600",
    teal: "bg-gradient-to-br from-teal-500 to-cyan-600",
    violet: "bg-gradient-to-br from-violet-500 to-purple-600",
    amber: "bg-gradient-to-br from-amber-500 to-orange-600",
    emerald: "bg-gradient-to-br from-emerald-500 to-teal-600",
    rose: "bg-gradient-to-br from-rose-500 to-pink-600",
    cyan: "bg-gradient-to-br from-cyan-500 to-blue-600",
    indigo: "bg-gradient-to-br from-indigo-500 to-purple-600"
  }
  
  return colorMap[color] || colorMap.blue
}