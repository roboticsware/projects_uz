import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../database/schema'

export function useDb() {
  const config = useRuntimeConfig()
  
  // In development, if URL is not provided, fallback to a local SQLite file
  const url = process.env.TURSO_DATABASE_URL || 'file:./local.db'
  const authToken = process.env.TURSO_AUTH_TOKEN

  const client = createClient({
    url,
    authToken,
  })

  return drizzle(client, { schema })
}
