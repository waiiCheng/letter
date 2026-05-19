export type Entry = {
  id: string
  author: 'a' | 'b'
  content: string
  visibility?: 'private' | 'visible'
  made_visible_at?: string | null
  created_at: string
}

export type MirrorEntry = {
  id: string
  event_date: string
  author: 'a' | 'b'
  content: string
  created_at: string
}

export type MemoryEntry = {
  id: string
  author: 'a' | 'b'
  content: string
  created_at: string
  revises_id: string | null
}
