import fs from 'fs'
import path from 'path'
import process from 'process'

// Load .env.local (if present) into process.env for convenience (mirrors seed.mjs)
try {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const idx = trimmed.indexOf('=')
      if (idx === -1) return
      let key = trimmed.slice(0, idx).trim()
      let val = trimmed.slice(idx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      process.env[key] = val
    })
    console.log('Loaded env from .env.local')
  }
} catch (e) {
  console.warn('Failed to load .env.local:', e?.message ?? e)
}

async function run() {
  const sqlPath = path.resolve(process.cwd(), 'scripts/schema.sql')
  if (!fs.existsSync(sqlPath)) {
    console.error('schema.sql not found at', sqlPath)
    process.exit(1)
  }

  const sql = fs.readFileSync(sqlPath, 'utf8')

  let DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set. Export DATABASE_URL to run schema apply.')
    console.log('You can instead run scripts/schema.sql manually in Supabase SQL editor.')
    process.exit(1)
  }

  // sanitize and sanity-check DATABASE_URL
  if (typeof DATABASE_URL === 'string') {
    DATABASE_URL = DATABASE_URL.trim()
    // remove surrounding quotes if present
    if ((DATABASE_URL.startsWith('"') && DATABASE_URL.endsWith('"')) || (DATABASE_URL.startsWith("'") && DATABASE_URL.endsWith("'"))) {
      DATABASE_URL = DATABASE_URL.slice(1, -1)
    }
  }

  try {
    // quick validation
    // eslint-disable-next-line no-undef
    new URL(DATABASE_URL)
  } catch (e) {
    console.error('DATABASE_URL appears malformed:', String(DATABASE_URL).slice(0, 80))
    console.error(e)
    process.exit(1)
  }
  // Masked log for safety
  const shown = String(DATABASE_URL)
  console.log('Using DATABASE_URL starting with:', shown.slice(0, 20) + '...')

  try {
    const { Client } = await import('pg')
    const client = new Client({ connectionString: DATABASE_URL })
    await client.connect()
    console.log('Connected to DB, running schema.sql...')
    await client.query(sql)
    console.log('Schema applied successfully.')
    await client.end()
  } catch (err) {
    console.error('Failed to apply schema:', err)
    process.exit(1)
  }
}

run()
