// Performance monitoring utilities
export function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const start = performance.now()
    
    try {
      const result = await fn()
      const end = performance.now()
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`)
      }
      
      resolve(result)
    } catch (error) {
      const end = performance.now()
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ ${name} failed after ${(end - start).toFixed(2)}ms:`, error)
      }
      
      reject(error)
    }
  })
}

// Database query performance wrapper
export function withPerformanceLogging<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  name: string
) {
  return async (...args: T): Promise<R> => {
    return measurePerformance(name, () => fn(...args))
  }
}

// Client-side performance metrics
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    console.log(metric)
  }
}