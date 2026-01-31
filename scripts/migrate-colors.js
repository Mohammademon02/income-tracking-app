// Migration script to add color field to existing accounts
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateColors() {
  try {
    console.log('Starting color migration...')
    
    // Find all accounts without a color field
    const accounts = await prisma.account.findMany({
      where: {
        OR: [
          { color: null },
          { color: undefined }
        ]
      }
    })
    
    console.log(`Found ${accounts.length} accounts without color field`)
    
    // Update each account with default blue color
    for (const account of accounts) {
      await prisma.account.update({
        where: { id: account.id },
        data: { color: 'blue' }
      })
      console.log(`Updated account: ${account.name}`)
    }
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateColors()