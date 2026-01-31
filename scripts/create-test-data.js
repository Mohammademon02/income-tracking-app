const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestData() {
  try {
    console.log('Creating test data...')
    
    // Create test account
    const account = await prisma.account.create({
      data: {
        name: 'Test Survey Account'
      }
    })
    
    console.log('Created test account:', account.name)
    
    // Create some test entries
    await prisma.dailyEntry.create({
      data: {
        accountId: account.id,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        points: 1500
      }
    })
    
    await prisma.dailyEntry.create({
      data: {
        accountId: account.id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        points: 2000
      }
    })
    
    console.log('Created test entries')
    
    // Create test withdrawals with different timing scenarios
    
    // Fast withdrawal (completed in 3 days)
    const fastWithdrawal = await prisma.withdrawal.create({
      data: {
        accountId: account.id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Requested 7 days ago
        amount: 10.00,
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // Completed 4 days ago (3 days processing)
      }
    })
    
    // Normal withdrawal (completed in 15 days)
    const normalWithdrawal = await prisma.withdrawal.create({
      data: {
        accountId: account.id,
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // Requested 20 days ago
        amount: 15.00,
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // Completed 5 days ago (15 days processing)
      }
    })
    
    // Slow withdrawal (completed in 25 days)
    const slowWithdrawal = await prisma.withdrawal.create({
      data: {
        accountId: account.id,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Requested 30 days ago
        amount: 20.00,
        status: 'COMPLETED',
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // Completed 5 days ago (25 days processing)
      }
    })
    
    // Pending withdrawal
    const pendingWithdrawal = await prisma.withdrawal.create({
      data: {
        accountId: account.id,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Requested 3 days ago
        amount: 12.00,
        status: 'PENDING'
      }
    })
    
    console.log('Created test withdrawals:')
    console.log('- Fast withdrawal (3 days):', fastWithdrawal.id)
    console.log('- Normal withdrawal (15 days):', normalWithdrawal.id)
    console.log('- Slow withdrawal (25 days):', slowWithdrawal.id)
    console.log('- Pending withdrawal:', pendingWithdrawal.id)
    
    console.log('✅ Test data created successfully!')
    
  } catch (error) {
    console.error('❌ Error creating test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestData()