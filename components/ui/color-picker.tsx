"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"
import { getAvatarGradient as getServerAvatarGradient } from "@/lib/avatar-utils"

const AVATAR_COLORS = [
  { name: "Blue", value: "blue", gradient: "from-blue-500 to-indigo-600" },
  { name: "Green", value: "green", gradient: "from-green-500 to-emerald-600" },
  { name: "Purple", value: "purple", gradient: "from-purple-500 to-indigo-600" },
  { name: "Pink", value: "pink", gradient: "from-pink-500 to-rose-600" },
  { name: "Orange", value: "orange", gradient: "from-orange-500 to-red-600" },
  { name: "Teal", value: "teal", gradient: "from-teal-500 to-cyan-600" },
  { name: "Violet", value: "violet", gradient: "from-violet-500 to-purple-600" },
  { name: "Amber", value: "amber", gradient: "from-amber-500 to-orange-600" },
  { name: "Emerald", value: "emerald", gradient: "from-emerald-500 to-teal-600" },
  { name: "Rose", value: "rose", gradient: "from-rose-500 to-pink-600" },
  { name: "Cyan", value: "cyan", gradient: "from-cyan-500 to-blue-600" },
  { name: "Indigo", value: "indigo", gradient: "from-indigo-500 to-purple-600" }
]

// Client-side version that uses the server utility
export function getAvatarGradient(color: string): string {
  return getServerAvatarGradient(color)
}

interface ColorPickerProps {
  selectedColor: string
  onColorChange: (color: string) => void
  name?: string
}

export function ColorPicker({ selectedColor, onColorChange, name = "color" }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <Label>Avatar Color</Label>
      <div className="grid grid-cols-6 gap-2">
        {AVATAR_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onColorChange(color.value)}
            className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${color.gradient} shadow-md hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            title={color.name}
          >
            {selectedColor === color.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="w-5 h-5 text-white drop-shadow-lg" />
              </div>
            )}
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={selectedColor} />
    </div>
  )
}