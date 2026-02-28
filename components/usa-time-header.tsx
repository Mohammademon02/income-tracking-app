"use client"

import { useState, useEffect } from "react"
import { Sun, Moon, Sunrise, Sunset } from "lucide-react"

interface USATimeHeaderProps {
    className?: string
}

export function USATimeHeader({ className = "" }: USATimeHeaderProps) {
    const [currentTime, setCurrentTime] = useState<Date>(new Date())
    const [timeZone, setTimeZone] = useState<string>("America/Chicago")

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    // Get time in selected US timezone
    const usaTime = new Intl.DateTimeFormat("en-US", {
        timeZone,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    }).format(currentTime)

    const hour = parseInt(
        new Intl.DateTimeFormat("en-US", {
            timeZone,
            hour: "2-digit",
            hour12: false,
        }).format(currentTime)
    )

    // Determine time of day
    const getTimeOfDay = (hour: number) => {
        if (hour >= 5 && hour < 12) return "morning"
        if (hour >= 12 && hour < 17) return "afternoon"
        if (hour >= 17 && hour < 20) return "evening"
        return "night"
    }

    const timeOfDay = getTimeOfDay(hour)

    // Get appropriate icon and colors
    const getTimeVisuals = (timeOfDay: string) => {
        switch (timeOfDay) {
            case "morning":
                return {
                    icon: Sunrise,
                    bgGradient: "from-orange-200 via-yellow-200 to-blue-200",
                    iconColor: "text-orange-500",
                    textColor: "text-orange-800",
                    shadowColor: "shadow-orange-500/30",
                    glowColor: "shadow-orange-400/50",
                    skyGradient: "from-orange-300/40 via-yellow-300/30 to-blue-300/20",
                }
            case "afternoon":
                return {
                    icon: Sun,
                    bgGradient: "from-yellow-200 via-orange-200 to-blue-300",
                    iconColor: "text-yellow-500",
                    textColor: "text-yellow-800",
                    shadowColor: "shadow-yellow-500/30",
                    glowColor: "shadow-yellow-400/50",
                    skyGradient: "from-yellow-300/40 via-orange-300/30 to-blue-400/20",
                }
            case "evening":
                return {
                    icon: Sunset,
                    bgGradient: "from-purple-300 via-pink-300 to-orange-300",
                    iconColor: "text-purple-500",
                    textColor: "text-purple-800",
                    shadowColor: "shadow-purple-500/30",
                    glowColor: "shadow-purple-400/50",
                    skyGradient: "from-purple-400/40 via-pink-400/30 to-orange-400/20",
                }
            default: // night
                return {
                    icon: Moon,
                    bgGradient: "from-indigo-400 via-purple-400 to-blue-600",
                    iconColor: "text-indigo-200",
                    textColor: "text-indigo-100",
                    shadowColor: "shadow-indigo-500/30",
                    glowColor: "shadow-indigo-400/50",
                    skyGradient: "from-indigo-500/40 via-purple-500/30 to-blue-600/20",
                }
        }
    }

    const visuals = getTimeVisuals(timeOfDay)
    const IconComponent = visuals.icon

    const timeZones = [
        { value: "America/New_York", label: "Eastern (ET)" },
        { value: "America/Chicago", label: "Central (CT)" },
        { value: "America/Denver", label: "Mountain (MT)" },
        { value: "America/Los_Angeles", label: "Pacific (PT)" },
    ]

    return (
        <div className={`relative overflow-hidden rounded-2xl transform-3d depth-3d ${className}`}>
            {/* 3D Sky Background with realistic day/night gradient */}
            <div
                className={`absolute inset-0 bg-gradient-to-br ${visuals.bgGradient} day-night-bg`}
            />

            {/* Atmospheric layers for depth */}
            <div className={`absolute inset-0 bg-gradient-to-t ${visuals.skyGradient}`} />

            {/* Animated floating elements for 3D atmosphere */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Floating atmospheric particles */}
                <div
                    className={`absolute top-4 right-8 w-3 h-3 ${visuals.iconColor} opacity-40 rounded-full floating-orb-1`}
                />
                <div
                    className={`absolute top-12 right-16 w-2 h-2 ${visuals.iconColor} opacity-30 rounded-full floating-orb-2`}
                />
                <div
                    className={`absolute top-8 right-24 w-1.5 h-1.5 ${visuals.iconColor} opacity-50 rounded-full floating-orb-3`}
                />

                {/* Time wave effect */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent time-wave" />

                {/* Glass reflection effect */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent glass-reflection" />
                </div>
            </div>

            {/* Glass morphism overlay with 3D depth */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl" />

            {/* Content with 3D positioning */}
            <div className="relative z-10 p-6 transform-3d">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* 3D Time Icon with enhanced glow and depth */}
                        <div className={`relative p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 ${visuals.shadowColor} shadow-2xl card-3d-hover`}>
                            {/* Inner glow ring */}
                            <div className={`absolute inset-0 rounded-full ${visuals.glowColor} shadow-2xl animate-pulse`} />
                            {/* Outer atmospheric glow */}
                            <div className={`absolute -inset-2 rounded-full ${visuals.glowColor} opacity-30 shadow-3xl animate-pulse`} style={{ animationDelay: '0.5s' }} />

                            <IconComponent
                                className={`relative z-10 w-8 h-8 ${visuals.iconColor} time-icon-glow`}
                            />

                            {/* 3D depth indicator */}
                            <div className="absolute -bottom-1 -right-1 w-full h-full rounded-full bg-black/10 -z-10" />
                        </div>

                        <div className="transform-3d">
                            <h1 className={`text-2xl sm:text-3xl font-bold ${visuals.textColor} drop-shadow-lg number-animate`}>
                                {usaTime.split(",")[0]}, {usaTime.split(",")[1].split(" at ")[0]}
                            </h1>
                            <p className={`${visuals.textColor} opacity-80 text-sm sm:text-base mt-1 drop-shadow-sm`}>
                                Welcome back! Here's your survey income overview
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 transform-3d">
                        {/* Enhanced Time Zone Selector with 3D effect */}
                        <select
                            value={timeZone}
                            onChange={(e) => setTimeZone(e.target.value)}
                            className={`px-3 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 ${visuals.textColor} text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-lg card-3d-hover`}
                        >
                            {timeZones.map((tz) => (
                                <option key={tz.value} value={tz.value} className="bg-white text-gray-800">
                                    {tz.label}
                                </option>
                            ))}
                        </select>

                        {/* Enhanced Digital Clock Display with 3D depth */}
                        <div className="text-right transform-3d">
                            <div className={`text-xl sm:text-2xl font-mono font-bold ${visuals.textColor} drop-shadow-lg number-animate`}>
                                {new Intl.DateTimeFormat("en-US", {
                                    timeZone,
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    hour12: true,
                                }).format(currentTime)}
                            </div>
                            <div className={`text-xs ${visuals.textColor} opacity-70 font-medium drop-shadow-sm`}>
                                {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Time
                            </div>

                            {/* 3D time indicator badge */}
                            <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs ${visuals.textColor} shadow-lg`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${visuals.iconColor} animate-pulse`} />
                                Live
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced 3D depth effect with multiple layers */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-black/10 via-black/5 to-black/10" />
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-black/20 to-transparent" />
        </div>
    )
}