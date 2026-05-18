import { supabase } from '../lib/supabase'

export type AsyncAuthor = 'a' | 'b'
export type AsyncVisibility = 'private' | 'visible'

export interface AsyncEntry {
  id: string
  author: AsyncAuthor
  content: string
  visibility: AsyncVisibility
  created_at: string
  made_visible_at: string | null
}

export async function writeAsyncEntry(author: AsyncAuthor, content: string) {
  const { data, error } = await supabase
    .from('async_entries')
    .insert({ author, content, visibility: 'private' })
    .select()
    .single()
  return { data, error }
}

export async function readAsyncEntries(viewer: AsyncAuthor) {
  const { data, error } = await supabase
    .from('async_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (!data) return { data: [], error }

  const filtered = data.filter((entry: AsyncEntry) =>
    entry.author === viewer || entry.visibility === 'visible'
  )
  return { data: filtered, error }
}

export async function publishAsyncEntry(id: string) {
  const { error } = await supabase
    .from('async_entries')
    .update({ visibility: 'visible', made_visible_at: new Date().toISOString() })
    .eq('id', id)
  return { error }
}
