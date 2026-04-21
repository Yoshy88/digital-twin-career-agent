import { neon } from '@neondatabase/serverless'

let sqlClient: ReturnType<typeof neon> | null = null

export function getSql() {
  if (sqlClient) {
    return sqlClient
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set. Add it to .env.local')
  }

  sqlClient = neon(databaseUrl)
  return sqlClient
}
