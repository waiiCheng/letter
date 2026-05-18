import { supabase } from '../lib/supabase'
import type { Entry } from '../types/entry'
import { sections } from '../content/sections'

export type { Entry }

export type LetterResponseWithSection = {
  id: string
  section_id: string
  topic: string
  original: string
  content: string
  created_at: string
}

export async function readDrawerEntries() {
  const { data, error } = await supabase
    .from('drawer_entries')
    .select('*')
    .order('created_at', { ascending: false })
  return { data: (data ?? []) as Entry[], error }
}

export async function readMemoryEntries() {
  const { data, error } = await supabase
    .from('memory_entries')
    .select('*')
    .order('created_at', { ascending: true })
  return { data: (data ?? []) as Entry[], error }
}

export async function readLetterResponsesWithSection() {
  const { data, error } = await supabase
    .from('letter_responses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) return { data: [] as LetterResponseWithSection[], error }

  const enriched: LetterResponseWithSection[] = data.map((r) => {
    const section = sections.find((s) => s.id === r.section_id)
    return {
      ...r,
      topic: section?.topic ?? r.section_id,
      original: section?.paragraphs[0] ?? '',
    }
  })

  return { data: enriched, error: null }
}
