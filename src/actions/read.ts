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

export async function readDrawerEntries(viewer: 'a' | 'b') {
  const { data, error } = await supabase
    .from('drawer_entries')
    .select('*')
    .or(`author.eq.${viewer},visibility.eq.visible`)
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

export async function readMirrorEntries() {
  const { data, error } = await supabase
    .from('mirror_entries')
    .select('*')
    .order('event_date', { ascending: false })
    .order('created_at', { ascending: true })
  return { data: (data ?? []) as import('../types/entry').MirrorEntry[], error }
}

export async function readCarveEntries() {
  const { data, error } = await supabase
    .from('memory_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) return { data: [], error }

  // 过滤掉被 revises_id 引用的旧版本
  const revisedIds = new Set(
    data
      .filter((e: any) => e.revises_id)
      .map((e: any) => e.revises_id)
  )

  const latest = data.filter((e: any) => !revisedIds.has(e.id))

  return { data: latest as import('../types/entry').MemoryEntry[], error: null }
}
