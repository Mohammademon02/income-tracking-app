"use client"

import { useState, useEffect } from "react"
import { Target, TrendingUp, Calendar, Award, Plus, Edit2, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { enhancedToast } from "@/components/ui/enhanced-toast"

interface Goal {
  id: string
  title: string
  description?: string
  targetAmount: number
  currentAmount: number
  startDate: Date
  targetDate: Date
  type: 'points' | 'earnings' | 'withdrawals'
  status: 'active' | 'completed' | 'paused'
  createdAt: Date
}

interface GoalTrackerProps {
  accounts: Array<{
    id: string
    name: string
    totalPoints: number
    completedWithdrawals: number
    currentBalance: number
  }>
  entries: Array<{
    date: Date
    points: number
  }>
}

export function GoalTracker({ accounts, entries }: GoalTrackerProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  // Load goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('survey-tracker-goals')
    if (savedGoals) {
      try {
        const parsed = JSON.parse(savedGoals).map((goal: any) => ({
          ...goal,
          startDate: new Date(goal.startDate),
          targetDate: new Date(goal.targetDate),
          createdAt: new Date(goal.createdAt)
        }))
        setGoals(parsed)
      } catch (error) {
        console.error('Failed to load goals:', error)
      }
    } else {
      // Set default goals
      const defaultGoals: Goal[] = [
        {
          id: '1',
          title: 'Monthly Points Target',
          description: 'Earn 10,000 points this month',
          targetAmount: 10000,
          currentAmount: 0,
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
          targetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // Last day of current month
          type: 'points',
          status: 'active',
          createdAt: new Date()
        },
        {
          id: '2',
          title: 'First $100 Withdrawal',
          description: 'Reach your first $100 withdrawal milestone',
          targetAmount: 100,
          currentAmount: 0,
          startDate: new Date(), // Today
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          type: 'earnings',
          status: 'active',
          createdAt: new Date()
        }
      ]
      setGoals(defaultGoals)
    }
  }, [])

  // Save goals to localStorage
  useEffect(() => {
    localStorage.setItem('survey-tracker-goals', JSON.stringify(goals))
  }, [goals])

  // Calculate current progress for each goal
  const calculateProgress = (goal: Goal) => {
    let current = 0

    switch (goal.type) {
      case 'points':
        // Calculate points within the goal's date range
        current = entries
          .filter(entry => {
            const entryDate = new Date(entry.date)
            const startDate = new Date(goal.startDate)
            const endDate = new Date(goal.targetDate)
            
            // Set time to start/end of day for accurate comparison
            startDate.setHours(0, 0, 0, 0)
            endDate.setHours(23, 59, 59, 999)
            entryDate.setHours(12, 0, 0, 0) // Noon to avoid timezone issues
            
            return entryDate >= startDate && entryDate <= endDate
          })
          .reduce((sum, entry) => sum + entry.points, 0)
        break
      case 'earnings':
        current = accounts.reduce((sum, acc) => sum + acc.completedWithdrawals, 0)
        break
      case 'withdrawals':
        current = accounts.reduce((sum, acc) => sum + acc.completedWithdrawals, 0)
        break
    }

    return Math.min(current, goal.targetAmount)
  }

  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date(),
      currentAmount: 0
    }
    setGoals(prev => [...prev, newGoal])
    enhancedToast.success("Goal created!", {
      description: `"${goalData.title}" has been added to your goals`
    })
  }

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal =>
      goal.id === goalId ? { ...goal, ...updates } : goal
    ))
    enhancedToast.success("Goal updated!", {
      description: "Your goal has been updated successfully"
    })
  }

  const deleteGoal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId)
    setGoals(prev => prev.filter(goal => goal.id !== goalId))
    enhancedToast.success("Goal deleted", {
      description: `"${goal?.title}" has been removed`
    })
  }

  const getGoalStatus = (goal: Goal) => {
    const progress = calculateProgress(goal)
    const percentage = (progress / goal.targetAmount) * 100
    const daysLeft = Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    if (percentage >= 100) return { status: 'completed', color: 'green' }
    if (daysLeft < 0) return { status: 'overdue', color: 'red' }
    if (daysLeft <= 7) return { status: 'urgent', color: 'orange' }
    return { status: 'on-track', color: 'blue' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Goal Tracker</h2>
          <p className="text-slate-600">Track your progress towards survey income goals</p>
        </div>
        <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
          <DialogTrigger asChild>
            <Button className="bg-linear-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <GoalDialog
            onSave={addGoal}
            onClose={() => setShowAddGoal(false)}
          />
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No goals set</h3>
            <p className="text-slate-500 mb-4">Create your first goal to start tracking progress</p>
            <Button onClick={() => setShowAddGoal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = calculateProgress(goal)
            const percentage = Math.min((progress / goal.targetAmount) * 100, 100)
            const goalStatus = getGoalStatus(goal)
            const daysLeft = Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

            return (
              <Card key={goal.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      {goal.description && (
                        <CardDescription className="mt-1">{goal.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingGoal(goal)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoal(goal.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-semibold">
                        {goal.type === 'points' ? progress.toLocaleString() : `$${progress.toFixed(2)}`} / {goal.type === 'points' ? goal.targetAmount.toLocaleString() : `$${goal.targetAmount.toFixed(2)}`}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{percentage.toFixed(1)}% complete</span>
                      <Badge
                        variant="secondary"
                        className={`${goalStatus.color === 'green' ? 'bg-green-100 text-green-700 border-green-200' :
                          goalStatus.color === 'red' ? 'bg-red-100 text-red-700 border-red-200' :
                            goalStatus.color === 'orange' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                              'bg-blue-100 text-blue-700 border-blue-200'
                          }`}
                      >
                        {goalStatus.status === 'completed' ? '✅ Completed' :
                          goalStatus.status === 'overdue' ? '⏰ Overdue' :
                            goalStatus.status === 'urgent' ? '🔥 Urgent' :
                              '📈 On Track'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>Date Range</span>
                    </div>
                    <span className="font-medium">
                      {goal.startDate.toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short'
                      })} - {goal.targetDate.toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Days Left</span>
                    <span className={`font-medium ${daysLeft < 0 ? 'text-red-600' :
                      daysLeft <= 7 ? 'text-orange-600' :
                        'text-slate-800'
                      }`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days`}
                    </span>
                  </div>

                  {percentage >= 100 && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <Award className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Goal Achieved! 🎉</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Goal Dialog */}
      {editingGoal && (
        <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
          <GoalDialog
            goal={editingGoal}
            onSave={(goalData) => {
              updateGoal(editingGoal.id, goalData)
              setEditingGoal(null)
            }}
            onClose={() => setEditingGoal(null)}
          />
        </Dialog>
      )}
    </div>
  )
}

interface GoalDialogProps {
  goal?: Goal
  onSave: (goal: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => void
  onClose: () => void
}

function GoalDialog({ goal, onSave, onClose }: GoalDialogProps) {
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    targetAmount: goal?.targetAmount || 0,
    startDate: goal?.startDate ? goal.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    targetDate: goal?.targetDate ? goal.targetDate.toISOString().split('T')[0] : '',
    type: goal?.type || 'points' as const,
    status: goal?.status || 'active' as const
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.targetAmount || !formData.startDate || !formData.targetDate) {
      enhancedToast.error("Please fill in all required fields")
      return
    }

    if (new Date(formData.startDate) >= new Date(formData.targetDate)) {
      enhancedToast.error("Start date must be before target date")
      return
    }

    onSave({
      title: formData.title,
      description: formData.description,
      targetAmount: formData.targetAmount,
      startDate: new Date(formData.startDate),
      targetDate: new Date(formData.targetDate),
      type: formData.type,
      status: formData.status
    })

    onClose()
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{goal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
        <DialogDescription>
          Set a target to track your survey income progress
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Goal Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Monthly Points Target"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Optional description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Goal Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'points' | 'earnings' | 'withdrawals') =>
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="points">Points</SelectItem>
                <SelectItem value="earnings">Earnings ($)</SelectItem>
                <SelectItem value="withdrawals">Withdrawals ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount *</Label>
            <Input
              id="targetAmount"
              type="number"
              value={formData.targetAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: parseFloat(e.target.value) || 0 }))}
              placeholder={formData.type === 'points' ? '10000' : '100'}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date *</Label>
            <Input
              id="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {goal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}