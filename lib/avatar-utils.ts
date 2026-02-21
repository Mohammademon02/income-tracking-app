// Server-side utility for avatar colors
export function getAvatarGradient(color: string): string {
  const colorMap: Record<string, string> = {
    blue: "bg-linear-to-br from-blue-500 to-indigo-600",
    green: "bg-linear-to-br from-green-500 to-emerald-600",
    purple: "bg-linear-to-br from-purple-500 to-indigo-600",
    pink: "bg-linear-to-br from-pink-500 to-rose-600",
    orange: "bg-linear-to-br from-orange-500 to-red-600",
    teal: "bg-linear-to-br from-teal-500 to-cyan-600",
    violet: "bg-linear-to-br from-violet-500 to-purple-600",
    amber: "bg-linear-to-br from-amber-500 to-orange-600",
    emerald: "bg-linear-to-br from-emerald-500 to-teal-600",
    rose: "bg-linear-to-br from-rose-500 to-pink-600",
    cyan: "bg-linear-to-br from-cyan-500 to-blue-600",
    indigo: "bg-linear-to-br from-indigo-500 to-purple-600",
  };

  return colorMap[color] || colorMap.blue;
}
