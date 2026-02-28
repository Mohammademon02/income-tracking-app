"use client"

import { useState, useEffect } from "react"
import { Sun, Moon, Sunrise, Sunset, Star } from "lucide-react"

interface ScenicTimeHeaderProps {
    className?: string
}

export function ScenicTimeHeader({ className = "" }: ScenicTimeHeaderProps) {
    const [currentTime, setCurrentTime] = useState<Date>(new Date())
    const [timeZone, setTimeZone] = useState<string>("America/Chicago")

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

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

    const minute = parseInt(
        new Intl.DateTimeFormat("en-US", {
            timeZone,
            minute: "2-digit",
        }).format(currentTime)
    )

    const getTimeOfDay = (hour: number) => {
        if (hour >= 6 && hour < 12) return "morning"
        if (hour >= 12 && hour < 17) return "day"
        if (hour >= 17 && hour < 20) return "sunset"
        return "night"
    }

    const timeOfDay = getTimeOfDay(hour)

    // Calculate sun/moon position based on time (0-100% across the sky)
    const getSunMoonPosition = (hour: number, minute: number) => {
        const totalMinutes = hour * 60 + minute

        // Sun arc from 6 AM to 8 PM (sunrise to sunset)
        if (totalMinutes >= 360 && totalMinutes <= 1200) { // 6 AM to 8 PM
            const sunMinutes = totalMinutes - 360 // Minutes since 6 AM
            const sunDuration = 840 // 14 hours (6 AM to 8 PM)
            const progress = sunMinutes / sunDuration

            // Create an arc path (parabola) - high at noon, low at sunrise/sunset
            const x = progress * 100 // 0% to 100% left to right
            const y = Math.sin(progress * Math.PI) * 40 + 10 // Arc height (10% to 50% from top)

            return { x, y, isSun: true }
        } else {
            // Moon arc from 8 PM to 6 AM
            let moonMinutes
            if (totalMinutes >= 1200) { // 8 PM to midnight
                moonMinutes = totalMinutes - 1200
            } else { // Midnight to 6 AM
                moonMinutes = totalMinutes + 360 // Add 6 hours to continue the arc
            }

            const moonDuration = 600 // 10 hours (8 PM to 6 AM)
            const progress = moonMinutes / moonDuration

            const x = progress * 100
            const y = Math.sin(progress * Math.PI) * 30 + 15 // Slightly lower arc for moon

            return { x, y, isSun: false }
        }
    }

    const sunMoonPos = getSunMoonPosition(hour, minute)

    // Get contextual greeting based on time of day
    const getGreeting = (timeOfDay: string) => {
        switch (timeOfDay) {
            case "morning":
                return "Good Morning! Here's your survey income overview"
            case "day":
                return "Good Afternoon! Here's your survey income overview"
            case "sunset":
                return "Good Evening! Here's your survey income overview"
            default: // night
                return "Good Night! Here's your survey income overview"
        }
    }

    const greeting = getGreeting(timeOfDay)

    // Scenic landscape visuals inspired by your examples
    const getSceneVisuals = (timeOfDay: string) => {
        switch (timeOfDay) {
            case "morning":
                return {
                    icon: Sunrise,
                    // Bright morning with golden sun
                    skyGradient: "from-yellow-100 via-orange-200 to-sky-300",
                    mountainGradient: "from-green-400 via-emerald-500 to-teal-600",
                    sunMoonColor: "bg-yellow-400",
                    cloudColor: "bg-white/90",
                    textColor: "text-white",
                    iconColor: "text-yellow-200",
                    stars: false,
                }
            case "day":
                return {
                    icon: Sun,
                    // Clear blue day sky with white clouds
                    skyGradient: "from-sky-200 via-blue-300 to-cyan-400",
                    mountainGradient: "from-green-400 via-emerald-500 to-green-600",
                    sunMoonColor: "bg-yellow-500",
                    cloudColor: "bg-white",
                    textColor: "text-white",
                    iconColor: "text-yellow-200",
                    stars: false,
                }
            case "sunset":
                return {
                    icon: Sunset,
                    // Beautiful sunset with pink/orange sky
                    skyGradient: "from-pink-200 via-orange-300 to-purple-400",
                    mountainGradient: "from-orange-400 via-red-500 to-purple-600",
                    sunMoonColor: "bg-orange-400",
                    cloudColor: "bg-pink-100/80",
                    textColor: "text-white",
                    iconColor: "text-orange-200",
                    stars: false,
                }
            default: // night
                return {
                    icon: Moon,
                    // Dark night sky with stars
                    skyGradient: "from-indigo-600 via-blue-800 to-slate-900",
                    mountainGradient: "from-slate-600 via-slate-700 to-slate-800",
                    sunMoonColor: "bg-slate-300",
                    cloudColor: "bg-slate-400/40",
                    textColor: "text-white",
                    iconColor: "text-slate-200",
                    stars: true,
                }
        }
    }

    const scene = getSceneVisuals(timeOfDay)
    const IconComponent = scene.icon

    const timeZones = [
        { value: "America/New_York", label: "Eastern (ET)" },
        { value: "America/Chicago", label: "Central (CT)" },
        { value: "America/Denver", label: "Mountain (MT)" },
        { value: "America/Los_Angeles", label: "Pacific (PT)" },
    ]

    return (
        <div className={`relative overflow-hidden rounded-2xl shadow-2xl ${className}`}>
            {/* Sky Background */}
            <div className={`absolute inset-0 bg-gradient-to-b ${scene.skyGradient}`} />

            {/* Stars for night time - responsive positioning */}
            {scene.stars && (
                <div className="absolute inset-0">
                    <Star className="absolute top-4 left-4 sm:left-8 w-2 h-2 text-white animate-pulse" />
                    <Star className="absolute top-8 left-12 sm:left-20 w-1.5 h-1.5 text-white animate-pulse" style={{ animationDelay: '1s' }} />
                    <Star className="absolute top-6 left-20 sm:left-32 w-1 h-1 text-white animate-pulse" style={{ animationDelay: '2s' }} />
                    <Star className="absolute top-12 right-8 sm:right-16 w-1.5 h-1.5 text-white animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <Star className="absolute top-4 right-16 sm:right-32 w-1 h-1 text-white animate-pulse" style={{ animationDelay: '1.5s' }} />
                </div>
            )}

            {/* Animated Sun/Moon - Moves across sky based on time */}
            <div
                className={`absolute w-8 h-8 sm:w-12 sm:h-12 ${sunMoonPos.isSun ? scene.sunMoonColor : 'bg-slate-300'} rounded-full shadow-lg transition-all duration-1000 ease-in-out`}
                style={{
                    left: `${sunMoonPos.x}%`,
                    top: `${sunMoonPos.y}%`,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-full" />

                {/* Sun rays (only visible during day) */}
                {sunMoonPos.isSun && (timeOfDay === 'morning' || timeOfDay === 'day') && (
                    <div className="absolute inset-0">
                        <div className="absolute -top-4 left-1/2 w-0.5 h-3 bg-yellow-300 transform -translate-x-1/2 animate-pulse" />
                        <div className="absolute -bottom-4 left-1/2 w-0.5 h-3 bg-yellow-300 transform -translate-x-1/2 animate-pulse" />
                        <div className="absolute -left-4 top-1/2 w-3 h-0.5 bg-yellow-300 transform -translate-y-1/2 animate-pulse" />
                        <div className="absolute -right-4 top-1/2 w-3 h-0.5 bg-yellow-300 transform -translate-y-1/2 animate-pulse" />
                        <div className="absolute -top-3 -left-3 w-2 h-0.5 bg-yellow-300 transform rotate-45 animate-pulse" />
                        <div className="absolute -top-3 -right-3 w-2 h-0.5 bg-yellow-300 transform -rotate-45 animate-pulse" />
                        <div className="absolute -bottom-3 -left-3 w-2 h-0.5 bg-yellow-300 transform -rotate-45 animate-pulse" />
                        <div className="absolute -bottom-3 -right-3 w-2 h-0.5 bg-yellow-300 transform rotate-45 animate-pulse" />
                    </div>
                )}

                {/* Moon craters (only visible at night) */}
                {!sunMoonPos.isSun && (
                    <div className="absolute inset-0">
                        <div className="absolute top-2 left-2 w-1 h-1 bg-slate-400 rounded-full opacity-60" />
                        <div className="absolute top-3 right-2 w-0.5 h-0.5 bg-slate-400 rounded-full opacity-40" />
                        <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-slate-400 rounded-full opacity-50" />
                    </div>
                )}
            </div>

            {/* Clouds - responsive positioning */}
            <div className={`absolute top-6 sm:top-8 left-8 sm:left-16 w-12 h-4 sm:w-16 sm:h-6 ${scene.cloudColor} rounded-full`}>
                <div className={`absolute -left-1 sm:-left-2 top-0.5 sm:top-1 w-6 h-3 sm:w-8 sm:h-4 ${scene.cloudColor} rounded-full`} />
                <div className={`absolute -right-1 sm:-right-2 top-0.5 sm:top-1 w-8 h-3 sm:w-10 sm:h-4 ${scene.cloudColor} rounded-full`} />
            </div>

            <div className={`absolute top-8 sm:top-12 right-16 sm:right-32 w-8 h-3 sm:w-12 sm:h-5 ${scene.cloudColor} rounded-full`}>
                <div className={`absolute -left-0.5 sm:-left-1 top-0.5 w-4 h-2 sm:w-6 sm:h-3 ${scene.cloudColor} rounded-full`} />
                <div className={`absolute -right-0.5 sm:-right-1 top-0.5 w-6 h-2 sm:w-8 sm:h-3 ${scene.cloudColor} rounded-full`} />
            </div>

            {/* Mountain Layers */}
            <div className="absolute bottom-0 left-0 w-full h-32">
                {/* Back mountains */}
                <div className={`absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t ${scene.mountainGradient} opacity-60`}
                    style={{
                        clipPath: "polygon(0% 100%, 0% 60%, 15% 40%, 30% 50%, 45% 30%, 60% 45%, 75% 25%, 90% 40%, 100% 35%, 100% 100%)"
                    }} />

                {/* Front mountains */}
                <div className={`absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t ${scene.mountainGradient} opacity-80`}
                    style={{
                        clipPath: "polygon(0% 100%, 0% 80%, 20% 60%, 35% 70%, 50% 50%, 65% 65%, 80% 45%, 95% 55%, 100% 50%, 100% 100%)"
                    }} />
            </div>

            {/* Trees - responsive positioning */}
            <div className="absolute bottom-0 right-12 sm:right-20">
                {/* Tree trunk */}
                <div className="w-1.5 h-6 sm:w-2 sm:h-8 bg-amber-800 mx-auto" />
                {/* Tree foliage */}
                <div className="w-6 h-8 sm:w-8 sm:h-12 bg-green-600 rounded-full -mt-4 sm:-mt-6 shadow-lg" />
                <div className="w-4 h-6 sm:w-6 sm:h-8 bg-green-500 rounded-full -mt-6 sm:-mt-8 ml-1" />
            </div>

            <div className="absolute bottom-0 right-4 sm:right-8">
                <div className="w-1 h-4 sm:w-1.5 sm:h-6 bg-amber-800 mx-auto" />
                <div className="w-4 h-6 sm:w-6 sm:h-10 bg-green-600 rounded-full -mt-3 sm:-mt-4 shadow-lg" />
                <div className="w-3 h-4 sm:w-4 sm:h-6 bg-green-500 rounded-full -mt-4 sm:-mt-6 ml-0.5 sm:ml-1" />
            </div>

            {/* Small distant tree - hide on mobile */}
            <div className="hidden sm:block absolute bottom-0 left-32">
                <div className="w-1 h-4 bg-amber-800 mx-auto" />
                <div className="w-4 h-6 bg-green-700 rounded-full -mt-3" />
            </div>

            {/* Path/Road */}
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-r from-transparent via-yellow-100/50 to-transparent"
                style={{
                    clipPath: "polygon(40% 100%, 45% 0%, 55% 0%, 60% 100%)"
                }} />

            {/* Cat Silhouette - responsive positioning */}
            <div className="absolute bottom-2 right-20 sm:right-32 w-6 h-4 sm:w-8 sm:h-6">
                {/* Cat body */}
                <div className="absolute bottom-0 right-1.5 sm:right-2 w-3 h-2 sm:w-4 sm:h-3 bg-black rounded-lg" />
                {/* Cat head */}
                <div className="absolute bottom-1.5 sm:bottom-2 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-black rounded-full" />
                {/* Cat ears */}
                <div className="absolute bottom-3 sm:bottom-4 right-0 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-black transform rotate-45" />
                <div className="absolute bottom-3 sm:bottom-4 right-0.5 sm:right-1 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-black transform -rotate-45" />
                {/* Cat tail */}
                <div className="absolute bottom-0.5 sm:bottom-1 right-3.5 sm:right-5 w-2 h-0.5 sm:w-3 sm:h-1 bg-red-600 rounded-full" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 bg-black/25">
                <div className="p-4 sm:p-8">
                    {/* Mobile Layout */}
                    <div className="flex flex-col sm:hidden gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Time Icon */}
                                <div className="relative p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl">
                                    <IconComponent className={`w-6 h-6 ${scene.iconColor} drop-shadow-lg`} />
                                </div>
                                <div>
                                    <h1 className={`text-lg font-bold ${scene.textColor} drop-shadow-lg`}>
                                        {usaTime.split(",")[0]}
                                    </h1>
                                    <p className={`text-sm ${scene.textColor} opacity-90 drop-shadow-sm`}>
                                        {usaTime.split(",")[1].split(" at ")[0]}
                                    </p>
                                </div>
                            </div>

                            {/* Mobile Clock */}
                            <div className="text-right">
                                <div className={`text-lg font-mono font-bold ${scene.textColor} drop-shadow-lg`}>
                                    {new Intl.DateTimeFormat("en-US", {
                                        timeZone,
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    }).format(currentTime)}
                                </div>
                                <div className={`text-xs ${scene.textColor} opacity-80 font-medium drop-shadow-sm`}>
                                    {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Controls */}
                        <div className="flex items-center justify-between">
                            <select
                                value={timeZone}
                                onChange={(e) => setTimeZone(e.target.value)}
                                className={`px-3 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 ${scene.textColor} text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-lg`}
                            >
                                {timeZones.map((tz) => (
                                    <option key={tz.value} value={tz.value} className="bg-white text-gray-800">
                                        {tz.label}
                                    </option>
                                ))}
                            </select>

                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs ${scene.textColor} shadow-lg`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${scene.iconColor} animate-pulse`} />
                                Live
                            </div>
                        </div>

                        <p className={`${scene.textColor} opacity-90 text-sm drop-shadow-sm`}>
                            {greeting}
                        </p>
                    </div>

                    {/* Desktop Layout - Improved */}
                    <div className="hidden sm:block">
                        {/* Top Row - Date and Controls */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                {/* Time Icon */}
                                <div className="relative p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl">
                                    <IconComponent className={`w-8 h-8 ${scene.iconColor} drop-shadow-lg`} />
                                </div>

                                <div>
                                    <h1 className={`text-2xl lg:text-3xl font-bold ${scene.textColor} drop-shadow-lg leading-tight`}>
                                        {usaTime.split(",")[0]}, {usaTime.split(",")[1].split(" at ")[0]}
                                    </h1>
                                </div>
                            </div>

                            {/* Right Side Controls */}
                            <div className="flex flex-col items-end gap-3">
                                {/* Digital Clock - Prominent */}
                                <div className="text-right">
                                    <div className={`text-3xl lg:text-4xl font-mono font-bold ${scene.textColor} drop-shadow-lg leading-none`}>
                                        {new Intl.DateTimeFormat("en-US", {
                                            timeZone,
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            hour12: true,
                                        }).format(currentTime)}
                                    </div>
                                    <div className={`text-sm ${scene.textColor} opacity-80 font-medium drop-shadow-sm mt-1`}>
                                        {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Time
                                    </div>
                                </div>

                                {/* Controls Row */}
                                <div className="flex items-center gap-3">
                                    {/* Time Zone Selector */}
                                    <select
                                        value={timeZone}
                                        onChange={(e) => setTimeZone(e.target.value)}
                                        className={`px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 ${scene.textColor} text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-lg min-w-[140px]`}
                                    >
                                        {timeZones.map((tz) => (
                                            <option key={tz.value} value={tz.value} className="bg-white text-gray-800">
                                                {tz.label}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Live indicator */}
                                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 text-sm ${scene.textColor} shadow-lg`}>
                                        <div className={`w-2 h-2 rounded-full ${scene.iconColor} animate-pulse`} />
                                        Live
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row - Contextual Greeting */}
                        <div className="mt-2">
                            <p className={`${scene.textColor} opacity-90 text-base lg:text-lg drop-shadow-sm`}>
                                {greeting}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}