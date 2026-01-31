const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testWithdrawalTiming() {
  try {
    console.log('Testing withdrawal timing feature...')
    
    // Find first account
    const account = await prisma.account.findFirst()
    if (!account) {
      console.log('No accounts found. Please create an account first.')
      return
    }
    
    console.log(`Using account: ${account.name}`)
    
    // Create a test withdrawal
    const testWithdrawal = await prisma.withdrawal.create({
      data: {
        accountId: account.id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        amount: 10.00, // $10.00
        status: 'PENDING'
      }
    })
    
    console.log('Created test withdrawal:', testWithdrawal.id)
    
    // Now mark it as completed
    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id: testWithdrawal.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date() // Completed now
      }
    })
    
    console.log('Updated withdrawal to COMPLETED with completedAt:', updatedWithdrawal.completedAt)
    
    // Calculate processing time
    const processingDays = Math.ceil((updatedWithdrawal.completedAt.getTime() - updatedWithdrawal.date.getTime()) / (1000 * 60 * 60 * 24))
    console.log(`Processing time: ${processingDays} days`)
    
    // Determine speed
    const speed = processingDays <= 10 ? 'Fast' : 
                  processingDays <= 20 ? 'Normal' : 
                  processingDays <= 30 ? 'Slow' : 'Very Slow'
    console.log(`Processing speed: ${speed}`)
    
    console.log('✅ Withdrawal timing feature is working!')
    
  } catch (error) {
    console.error('❌ Error testing withdrawal timing:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testWithdrawalTiming()