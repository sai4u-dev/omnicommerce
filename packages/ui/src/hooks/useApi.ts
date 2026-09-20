import { useCallback, useState } from 'react'

export function useApi<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const execute = useCallback(async () => {
    setLoading(true); setError(null)
    try { const d = await fn(); setData(d); return d } catch (e: any) { setError(e.message); throw e } finally { setLoading(false) }
  }, [fn])
  return { data, loading, error, execute, setData }
}
