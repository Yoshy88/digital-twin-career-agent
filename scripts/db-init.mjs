import fs from 'node:fs'
import path from 'node:path'
import { neon } from '@neondatabase/serverless'

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, 'utf8')
  for (const rawLine of envText.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }

    const equalsIndex = line.indexOf('=')
    if (equalsIndex <= 0) {
      continue
    }

    const key = line.slice(0, equalsIndex).trim()
    const value = line.slice(equalsIndex + 1).trim()
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL is not set. Add it to .env.local or your shell env and retry.')
  process.exit(1)
}

const schemaPath = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql')
const schemaSql = fs.readFileSync(schemaPath, 'utf8')
const statements = schemaSql
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean)

const sql = neon(databaseUrl)

try {
  for (const statement of statements) {
    await sql.query(statement)
  }
  console.log('Database schema applied successfully.')
} catch (error) {
  console.error('Failed to apply database schema:', error)
  process.exit(1)
}
