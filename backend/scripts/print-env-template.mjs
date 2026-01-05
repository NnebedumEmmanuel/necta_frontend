#!/usr/bin/env node
// prints the expected environment variable keys and a copy-paste block
const vars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_API_URL',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'PAYSTACK_SECRET_KEY',
  'SENTRY_DSN',
  'NODE_ENV',
  'PORT'
]

console.log('# Copy/paste these into Vercel or your .env.local and fill the values')
console.log(vars.map((k) => `${k}=`).join('\n'))
