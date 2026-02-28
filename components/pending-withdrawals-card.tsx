"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Activity, Zap, DollarSign } from "lucide-react"
import { PendingWithdrawalsModal } from "@/components/pending-withdrawals-modal"

interface PendingWithdrawal {
    id: string
    accountId: string
    accountName: string
    accountColor: string
    amount: number
    date: Date | string
    status: string
}

interface PendingWithdrawalsCardProps {
    pendingWithdrawals: PendingWithdrawal[]
    totalPending: number
    allWithdrawals?: any[] // All withdrawals for first withdrawal detection
}

export function PendingWithdrawalsCard({ pendingWithdrawals, totalPending, allWithdrawals = [] }: PendingWithdrawalsCardProps) {
    const [isPendingModalOpen, setIsPendingModalOpen] = useState(false)

    const cardVariants = {
        initial: { 
            scale: 1,
            rotateY: 0,
            rotateX: 0
        },
        hover: {
            scale: 1.05,
            rotateY: 5,
            rotateX: 5,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 300
            }
        }
    }

    const waveVariants = {
        animate: {
            x: ['-100%', '100%'],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "linear"
            }
        }
    }

    const particleVariants = {
        animate: {
            y: [0, -10, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    }

    const iconVariants = {
        animate: {
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    }

    const glowVariants = {
        animate: {
            boxShadow: [
                "0 0 20px rgba(251, 146, 60, 0.3)",
                "0 0 40px rgba(251, 146, 60, 0.6), 0 0 60px rgba(251, 146, 60, 0.2)",
                "0 0 20px rgba(251, 146, 60, 0.3)"
            ],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    }

    return (
        <>
            <motion.div
                variants={cardVariants}
                initial="initial"
                whileHover="hover"
                style={{ perspective: '1000px' }}
            >
                <motion.div
                    variants={glowVariants}
                    animate="animate"
                >
                    <Card
                        className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg shadow-orange-200/50 cursor-pointer transform-3d"
                        onClick={() => setIsPendingModalOpen(true)}
                    >
                        {/* Advanced Animated Wave Background */}
                        <div className="absolute inset-0 overflow-hidden">
                            {/* Multiple wave layers with different speeds */}
                            <motion.div 
                                className="absolute top-0 left-0 w-[200%] h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                variants={waveVariants}
                                animate="animate"
                            />
                            <motion.div 
                                className="absolute top-4 left-0 w-[200%] h-1 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                                variants={waveVariants}
                                animate="animate"
                                transition={{ delay: 1, duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                            <motion.div 
                                className="absolute top-8 left-0 w-[200%] h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                variants={waveVariants}
                                animate="animate"
                                transition={{ delay: 2, duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                            
                            {/* Floating particles with different animations */}
                            <motion.div 
                                className="absolute top-6 right-8 w-2 h-2 bg-white/30 rounded-full"
                                variants={particleVariants}
                                animate="animate"
                            />
                            <motion.div 
                                className="absolute top-12 right-16 w-1 h-1 bg-white/40 rounded-full"
                                variants={particleVariants}
                                animate="animate"
                                transition={{ delay: 0.5, duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <motion.div 
                                className="absolute top-16 right-12 w-1.5 h-1.5 bg-white/25 rounded-full"
                                variants={particleVariants}
                                animate="animate"
                                transition={{ delay: 1, duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                            
                            {/* Energy orbs */}
                            <motion.div
                                className="absolute top-10 right-6 w-3 h-3 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 1, 0.5],
                                    rotate: [0, 180, 360]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            
                            {/* Shimmer overlay with enhanced effect */}
                            <motion.div 
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{
                                    x: ['-100%', '100%']
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear",
                                    repeatDelay: 1
                                }}
                            />
                        </div>

                        {/* Decorative circle with morphing animation */}
                        <motion.div 
                            className="absolute top-0 right-0 w-20 h-20 bg-white/10 -mr-10 -mt-10"
                            animate={{
                                borderRadius: [
                                    "60% 40% 30% 70% / 60% 30% 70% 40%",
                                    "30% 60% 70% 40% / 50% 60% 30% 60%",
                                    "50% 60% 30% 60% / 60% 40% 60% 40%",
                                    "60% 40% 60% 30% / 40% 70% 40% 50%"
                                ],
                                rotate: [0, 90, 180, 270, 360]
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        
                        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-orange-100">Pending Withdrawals</CardTitle>
                            <motion.div variants={iconVariants} animate="animate">
                                <Clock className="h-5 w-5 text-orange-200" />
                            </motion.div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <motion.div 
                                className="text-3xl font-bold"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                            >
                                {totalPending.toLocaleString()} <span className="text-lg text-orange-200">pts</span>
                            </motion.div>
                            <motion.div 
                                className="text-xl font-semibold text-orange-100 mb-2"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, type: "spring", damping: 15 }}
                            >
                                ${(totalPending / 100).toFixed(2)}
                            </motion.div>
                            <motion.div 
                                className="flex items-center mt-2 text-orange-100"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4, type: "spring", damping: 15 }}
                            >
                                <motion.div variants={iconVariants} animate="animate">
                                    <Activity className="w-4 h-4 mr-1" />
                                </motion.div>
                                <span className="text-sm">Awaiting completion</span>
                            </motion.div>
                            <motion.p 
                                className="text-xs text-orange-200 mt-1"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, type: "spring", damping: 15 }}
                            >
                                Withdrawal requests in progress
                            </motion.p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <PendingWithdrawalsModal
                isOpen={isPendingModalOpen}
                onClose={() => setIsPendingModalOpen(false)}
                withdrawals={pendingWithdrawals}
                allWithdrawals={allWithdrawals}
            />
        </>
    )
}