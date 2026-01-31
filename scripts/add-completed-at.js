const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addCompletedAtField() {
  try {
    console.log('Adding completedAt field to existing completed withdrawals...')
    
    // Find all completed withdrawals that don't have completedAt
    const completedWithdrawals = await prisma.withdrawal.findMany({
      where: {
        status: 'COMPLETED'
      }
    })
    
    console.log(`Found ${completedWithdrawals.length} completed withdrawals`)
    
    // Update each completed withdrawal with a completedAt date
    // For existing completed withdrawals, we'll set completedAt to the same as the request date
    // (since we don't have the actual completion date)
    for (const withdrawal of completedWithdrawals) {
      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          completedAt: withdrawal.date // Use request date as fallback
        }
      })
    }
    
    console.log('Successfully updated all completed withdrawals with completedAt field')
  } catch (error) {
    console.error('Error updating withdrawals:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addCompletedAtField()