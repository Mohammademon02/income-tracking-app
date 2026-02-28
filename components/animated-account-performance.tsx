"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAvatarGradient } from "@/lib/avatar-utils"
import { Activity, Users, Star, Zap, Crown, TrendingUp } from "lucide-react"
import { WaterWaveEffect } from "./water-wave-effect"

type Account = {
    id: string
    name: string
    color: string
    totalPoints: number
    completedWithdrawals: number
    pendingWithdrawals: number
    currentBalance: number
    createdAt: Date
}

interface AnimatedAccountPerformanceProps {
    accounts: Account[]
    totalPoints: number
}

export function AnimatedAccountPerformance({ accounts, totalPoints }: AnimatedAccountPerformanceProps) {
    const [hoveredAccount, setHoveredAccount] = useState<string | null>(null)
    const [animationComplete, setAnimationComplete] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setAnimationComplete(true), 1000)
        return () => clearTimeout(timer)
    }, [])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    }

    const cardVariants = {
        hidden: {
            y: 50,
            opacity: 0,
            scale: 0.8,
            rotateX: -15
        },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            rotateX: 0,
            transition: {
                type: "spring",
                damping: 20,
                stiffness: 300,
                duration: 0.6
            }
        },
        hover: {
            scale: 1.02,
            y: -5,
            rotateY: 2,
            rotateX: 2,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 400
            }
        }
    }

    const progressVariants = {
        hidden: { width: "0%", opacity: 0 },
        visible: (progressValue: number) => ({
            width: `${progressValue}%`,
            opacity: 1,
            transition: {
                width: { duration: 1.5, ease: "easeOut", delay: 0.5 },
                opacity: { duration: 0.3, delay: 0.3 }
            }
        })
    }

    const avatarVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring",
                damping: 10,
                stiffness: 200,
                delay: 0.3
            }
        },
        hover: {
            scale: 1.1,
            rotate: 5,
            transition: { duration: 0.2 }
        }
    }

    const numberVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 300,
                delay: 0.4
            }
        }
    }

    const sparkleVariants = {
        hidden: { scale: 0, opacity: 0, rotate: 0 },
        visible: {
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360],
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
            }
        }
    }

    const getPerformanceIcon = (balance: number, totalPoints: number) => {
        if (balance >= 1000) return <Crown className="w-4 h-4 text-yellow-500" />
        if (totalPoints >= 1000) return <Star className="w-4 h-4 text-purple-500" />
        if (totalPoints >= 500) return <Zap className="w-4 h-4 text-blue-500" />
        return <TrendingUp className="w-4 h-4 text-green-500" />
    }

    const getPerformanceLabel = (balance: number, totalPoints: number) => {
        if (balance >= 1000) return { text: '👑 Withdrawal Ready', color: 'text-yellow-600' }
        if (totalPoints >= 1000) return { text: '🏆 Top Performer', color: 'text-purple-600' }
        if (totalPoints >= 500) return { text: '⭐ Active', color: 'text-blue-600' }
        if (totalPoints >= 100) return { text: '📈 Growing', color: 'text-green-600' }
        return { text: '🌱 New Account', color: 'text-slate-600' }
    }

    if (accounts.length === 0) {
        return (
            <Card className="lg:col-span-2 bg-white/80 border border-white/60 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        Account Performance
                    </CardTitle>
                    <CardDescription>Balance and activity across all accounts</CardDescription>
                </CardHeader>
                <CardContent>
                    <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        </motion.div>
                        <p className="text-slate-500 text-lg">No accounts yet</p>
                        <p className="text-slate-400 text-sm">Add your first account to get started</p>
                    </motion.div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="lg:col-span-2 bg-white/80 border border-white/60 shadow-xl transform-3d">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <CardHeader className="transition-colors duration-300 hover:bg-slate-50/50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <Activity className="w-5 h-5 text-indigo-600" />
                        </motion.div>
                        Account Performance
                    </CardTitle>
                    <CardDescription>Balance and activity across all accounts</CardDescription>
                </CardHeader>
            </motion.div>

            <CardContent>
                <motion.div
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AnimatePresence>
                        {accounts.map((account, index) => {
                            const progressValue = totalPoints > 0 ? (account.totalPoints / totalPoints) * 100 : 0
                            const isWithdrawalReady = account.currentBalance >= 1000
                            const performanceLabel = getPerformanceLabel(account.currentBalance, account.totalPoints)

                            return (
                                <motion.div
                                    key={account.id}
                                    variants={cardVariants}
                                    className={`relative cursor-pointer overflow-hidden ${index < 5 ? `stagger-${index + 1}` : ''}`}
                                >
                                    {/* Water Wave Effect for Withdrawal Ready Cards */}
                                    <WaterWaveEffect
                                        isActive={isWithdrawalReady}
                                        className="rounded-lg"
                                    />

                                    <div className="relative rounded-lg p-4 z-20 border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm">{/* Increased z-index and background opacity */}

                                        {/* Animated Background Particles */}
                                        {isWithdrawalReady && (
                                            <>
                                                <motion.div
                                                    className="absolute top-2 right-4 w-1 h-1 bg-green-400 rounded-full particle-1"
                                                    variants={sparkleVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                />
                                                <motion.div
                                                    className="absolute top-6 right-8 w-1.5 h-1.5 bg-emerald-400 rounded-full particle-2"
                                                    variants={sparkleVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                />
                                                <motion.div
                                                    className="absolute top-4 right-12 w-0.5 h-0.5 bg-green-300 rounded-full particle-3"
                                                    variants={sparkleVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                />
                                            </>
                                        )}

                                        {/* Morphing Background Blob - Removed */}

                                        <div className="flex items-center justify-between mb-3 relative z-30">
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    className="relative"
                                                    variants={avatarVariants}
                                                >
                                                    <motion.div
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/20 ${getAvatarGradient(account.color || "blue")} ${account.currentBalance >= 1000 ? 'shadow-xl shadow-orange-200/50 status-glow' :
                                                            account.currentBalance >= 500 ? 'shadow-lg shadow-emerald-200/50' : ''
                                                            }`}
                                                    >
                                                        {account.name.charAt(0).toUpperCase()}
                                                    </motion.div>

                                                    {/* Animated Performance Badges */}
                                                    {account.currentBalance >= 1000 && (
                                                        <motion.div
                                                            className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full border-2 border-white shadow-md flex items-center justify-center"
                                                            initial={{ scale: 0, rotate: -180 }}
                                                            animate={{
                                                                scale: 1,
                                                                rotate: 0,
                                                                y: [0, -2, 0]
                                                            }}
                                                            transition={{
                                                                scale: { delay: 0.5, type: "spring", damping: 10 },
                                                                rotate: { delay: 0.5, duration: 0.5 },
                                                                y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                                            }}
                                                        >
                                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                                        </motion.div>
                                                    )}

                                                    {account.currentBalance >= 500 && account.currentBalance < 1000 && (
                                                        <motion.div
                                                            className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-sm"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: 0.6, type: "spring", damping: 15 }}
                                                        />
                                                    )}
                                                </motion.div>

                                                <div>
                                                    <motion.p
                                                        className="font-semibold text-slate-800 text-lg drop-shadow-sm"
                                                        variants={numberVariants}
                                                        style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
                                                    >
                                                        {account.name}
                                                    </motion.p>
                                                    <motion.div
                                                        className="flex items-center gap-2"
                                                        variants={numberVariants}
                                                    >
                                                        {getPerformanceIcon(account.currentBalance, account.totalPoints)}
                                                        <span className={`text-sm font-medium ${performanceLabel.color}`}>
                                                            {performanceLabel.text}
                                                        </span>
                                                    </motion.div>
                                                    <motion.p
                                                        className="text-sm text-slate-500 drop-shadow-sm"
                                                        variants={numberVariants}
                                                        style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
                                                    >
                                                        {account.totalPoints.toLocaleString()} points earned
                                                    </motion.p>
                                                </div>
                                            </div>

                                            <motion.div
                                                className="text-right"
                                                variants={numberVariants}
                                            >
                                                <motion.p
                                                    className={`text-3xl font-bold number-animate drop-shadow-sm ${isWithdrawalReady ? 'text-green-600' : 'text-slate-800'}`}
                                                    style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
                                                >
                                                    {account.currentBalance.toLocaleString()}
                                                    <span className="text-sm text-slate-500 ml-1">pts</span>
                                                </motion.p>
                                                <p className="text-sm text-slate-400 drop-shadow-sm" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>${(account.currentBalance / 100).toFixed(2)}</p>

                                                <div className="flex flex-col gap-2 mt-3">
                                                    <AnimatePresence>
                                                        {isWithdrawalReady && (
                                                            <motion.div
                                                                className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium self-end"
                                                                initial={{ scale: 0, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                exit={{ scale: 0, opacity: 0 }}
                                                                transition={{ type: "spring", damping: 15 }}
                                                            >
                                                                <motion.div
                                                                    className="w-2 h-2 bg-green-500 rounded-full"
                                                                    animate={{ scale: [1, 1.2, 1] }}
                                                                    transition={{ duration: 1, repeat: Infinity }}
                                                                />
                                                                Ready to withdraw
                                                            </motion.div>
                                                        )}

                                                        {account.pendingWithdrawals > 0 && (
                                                            <motion.div
                                                                className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium self-end"
                                                                initial={{ scale: 0, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                transition={{ type: "spring", damping: 15, delay: 0.2 }}
                                                            >
                                                                <motion.div
                                                                    className="w-2 h-2 bg-orange-500 rounded-full"
                                                                    animate={{ opacity: [1, 0.3, 1] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                                />
                                                                ${account.pendingWithdrawals.toFixed(2)} withdrawal pending
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        </div>

                                        {/* Animated Progress Bar */}
                                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden relative z-30">
                                            <motion.div
                                                className={`h-3 rounded-full relative overflow-hidden ${isWithdrawalReady ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                                    index % 4 === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                                        index % 4 === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                                            index % 4 === 2 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                                                                'bg-gradient-to-r from-purple-500 to-pink-500'
                                                    } gradient-animated`}
                                                initial="hidden"
                                                animate="visible"
                                                variants={progressVariants}
                                                custom={progressValue}
                                            >
                                                {/* Shimmer effect */}
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                    animate={{ x: ['-100%', '100%'] }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "linear",
                                                        delay: 1
                                                    }}
                                                />
                                            </motion.div>
                                        </div>

                                        <motion.p
                                            className="text-xs text-slate-400 mt-2 relative z-30"
                                            variants={numberVariants}
                                        >
                                            {progressValue.toFixed(1)}% of total points
                                        </motion.p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </motion.div>
            </CardContent>
        </Card>
    )
}