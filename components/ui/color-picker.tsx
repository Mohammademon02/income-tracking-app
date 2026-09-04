"use client"

import { Check } from "lucide-react"

import { Label } from "@/components/ui/label"
import { ACCOUNT_COLORS } from "@/lib/avatar-utils"

/**
 * The swatch grid. Its palette used to be a second copy of the one in
 * `lib/avatar-utils`, alongside a `getAvatarGradient` re-export that nothing
 * imported — both are gone; the list has one home.
 */
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
        {ACCOUNT_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onColorChange(color.value)}
            className={`relative size-10 rounded-full bg-linear-to-br ${color.gradient} shadow-md transition-transform duration-200 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none`}
            title={color.name}
            aria-label={color.name}
            aria-pressed={selectedColor === color.value}
          >
            {selectedColor === color.value && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Check className="size-5 text-white drop-shadow-lg" />
              </span>
            )}
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={selectedColor} />
    </div>
  )
}
