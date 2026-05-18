import { supabase } from '../lib/supabase'

export async function writeLetterResponse(sectionId: string, content: string) {
  if (!content.trim()) return { error: null }
  const { error } = await supabase
    .from('letter_responses')
    .insert({ section_id: sectionId, content: content.trim() })
  return { error }
}

export async function writeDrawerEntry(content: string) {
  if (!content.trim()) return { error: null }
  const { error } = await supabase
    .from('drawer_entries')
    .insert({ author: 'me', content: content.trim() })
  return { error }
}

export async function writeMemoryEntry(content: string, existingId?: string) {
  if (!content.trim()) return { error: null }

  if (existingId) {
    // 24h 编辑窗口：检查是否在 24h 内
    const { data, error: fetchError } = await supabase
      .from('memory_entries')
      .select('created_at')
      .eq('id', existingId)
      .single()

    if (!fetchError && data) {
      const created = new Date(data.created_at).getTime()
      const now = Date.now()
      const within24h = now - created < 24 * 60 * 60 * 1000

      if (within24h) {
        const { error } = await supabase
          .from('memory_entries')
          .update({ content: content.trim() })
          .eq('id', existingId)
        return { error }
      }
    }
  }

  const { error } = await supabase
    .from('memory_entries')
    .insert({ author: 'me', content: content.trim() })
  return { error }
}
