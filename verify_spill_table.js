import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hubmfeamwepfrhycysab.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1Ym1mZWFtd2VwZnJoeWN5c2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzUyMjQsImV4cCI6MjA5NDM1MTIyNH0.e9ADRjMHeKLD8FLw_6_2N1erktpT5WfC6HBPHLtjDd4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyTables() {
  console.log('=== Step 1: List all public tables ===\n')

  // Check common table names
  const possibleNames = [
    'entries',
    'spill_entries',
    'drawer_entries',
    'timeline_entries',
    'letter_responses',
    'memory_entries',
    'async_entries'
  ]

  const foundTables = []

  for (const name of possibleNames) {
    const { data, error } = await supabase.from(name).select('*').limit(0)
    if (!error) {
      foundTables.push(name)
      console.log(`✓ Found table: ${name}`)
    }
  }

  console.log('\n=== All public tables found ===')
  console.log(foundTables.join(', '))

  // Get structure of drawer_entries (spill table)
  console.log('\n=== Structure of drawer_entries (spill table) ===\n')

  const { data: sample } = await supabase.from('drawer_entries').select('*').limit(1)

  if (sample && sample.length > 0) {
    const columns = Object.keys(sample[0])
    console.log('Columns and types:')
    columns.forEach(col => {
      const value = sample[0][col]
      const type = typeof value === 'object' && value !== null ? 'timestamp/json' : typeof value
      console.log(`  ${col}: ${type}`)
    })

    console.log('\nSample row:')
    console.log(JSON.stringify(sample[0], null, 2))
  } else {
    console.log('Table is empty. Checking with insert attempt...')
  }
}

verifyTables()
