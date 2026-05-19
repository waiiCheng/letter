import { useState, useEffect, createContext } from 'react'

const A_KEY = 'letter_a_identity'

export type Identity = 'a' | 'b'
export type EditMode = 'none' | 'a-editing' | 'b-editing'

export const IdentityContext = createContext<{
  identity: Identity
  editMode: EditMode
  setEditMode: (m: EditMode) => void
  forget: () => void
}>({
  identity: 'b',
  editMode: 'none',
  setEditMode: () => {},
  forget: () => {},
})

export function useIdentityProvider() {
  const [identity, setIdentity] = useState<Identity>(() =>
    localStorage.getItem(A_KEY) === 'true' ? 'a' : 'b'
  )
  const [editMode, setEditMode] = useState<EditMode>('none')

  useEffect(() => {
    const handler = () => {
      setIdentity(localStorage.getItem(A_KEY) === 'true' ? 'a' : 'b')
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const forget = () => {
    localStorage.removeItem(A_KEY)
    setIdentity('b')
    setEditMode('none')
  }

  useEffect(() => {
    let buffer = ''
    let bufferTimer: any = null

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editMode !== 'none') {
          sessionStorage.setItem('abort_edit', 'true')
          setEditMode('none')
        }
        buffer = ''
        return
      }

      const target = e.target as HTMLElement
      const isInputElement = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
      if (isInputElement) return

      if (/^[0-9]$/.test(e.key)) {
        buffer += e.key
        if (buffer.length > 4) buffer = buffer.slice(-4)
        clearTimeout(bufferTimer)
        bufferTimer = setTimeout(() => { buffer = '' }, 2000)
        return
      }

      if (e.key === 'Enter') {
        if (buffer === '1234') {
          if (identity === 'a') {
            setEditMode(editMode === 'a-editing' ? 'none' : 'a-editing')
          }
        } else if (buffer === '5678') {
          if (identity === 'b') {
            setEditMode(editMode === 'b-editing' ? 'none' : 'b-editing')
          }
        } else if (buffer === '0000') {
          forget()
        }
        buffer = ''
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [identity, editMode])

  return { identity, editMode, setEditMode, forget }
}
