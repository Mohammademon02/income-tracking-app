import { prisma } from "./prisma"

// Optimized database queries and caching
export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private constructor() {}

  public static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer()
    }
    return DatabaseOptimizer.instance
  }

  // Optimized pagination helper
  public async getPaginatedResults<T>(
    model: any,
    page: number = 1,
    limit: number = 10,
    where?: any,
    orderBy?: any,
    include?: any
  ): Promise<{
    data: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }> {
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      model.findMany({
        skip,
        take: limit,
        where,
        orderBy,
        include,
      }),
      model.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }

  // Cache management
  public async getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    const data = await fetcher()
    this.cache.set(key, { data, timestamp: Date.now() })
    
    return data
  }

  public clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  // Batch operations for better performance
  public async batchDeleteEntries(entryIds: string[]) {
    return prisma.dailyEntry.deleteMany({
      where: {
        id: {
          in: entryIds
        }
      }
    })
  }

  public async batchDeleteAccounts(accountIds: string[]) {
    return prisma.account.deleteMany({
      where: {
        id: { in: accountIds }
      }
    })
  }
}

// Export singleton instance
export const dbOptimizer = DatabaseOptimizer.getInstance()