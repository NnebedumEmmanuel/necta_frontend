#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

// Scan app/api for any imports of the client supabase helper or usage of anon key
const root = path.resolve(process.cwd(), 'app', 'api')
const badPatterns = ["supabase.client", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "supabase.client.ts", "lib/supabase.client"]
let found = []

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const ent of entries) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p)
    else if (ent.isFile() && p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.js') || p.endsWith('.mjs')) {
      const content = fs.readFileSync(p, 'utf8')
      for (const pattern of badPatterns) {
        if (content.includes(pattern)) {
          found.push({ file: p, pattern })
        }
      }
    }
  }
}

if (!fs.existsSync(root)) {
  console.log('No app/api folder found; skipping supabase usage check')
  process.exit(0)
}

walk(root)

if (found.length > 0) {
  console.error('\nDetected usage of client/anon Supabase in app/api files:')
  for (const f of found) console.error(` - ${path.relative(process.cwd(), f.file)} (matches: ${f.pattern})`)
  console.error('\nAll server-side API code must use supabaseAdmin from lib/supabase.server')
  process.exit(2)
} else {
  console.log('No client/anon Supabase usage detected in app/api — OK')
  process.exit(0)
}
