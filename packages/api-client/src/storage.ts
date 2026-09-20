// Universal storage adapter — works on Web, React Native (AsyncStorage), Electron
export interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void | Promise<void>
}

let asyncStorage: any = null
try {
  // lazy require for React Native; will be null on web
  // eslint-disable-next-line
  asyncStorage = null
} catch {}

export const memoryStorage: StorageAdapter = (() => {
  const map = new Map<string, string>()
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => { map.set(k, v) },
    removeItem: (k) => { map.delete(k) },
  }
})()

export const webStorage: StorageAdapter = typeof window !== 'undefined' && window.localStorage
  ? {
      getItem: (k) => window.localStorage.getItem(k),
      setItem: (k, v) => window.localStorage.setItem(k, v),
      removeItem: (k) => window.localStorage.removeItem(k),
    }
  : memoryStorage

// For React Native, caller should inject AsyncStorage via setStorage()
let activeStorage: StorageAdapter = webStorage

export function setStorage(s: StorageAdapter) {
  activeStorage = s
}

export function getStorage(): StorageAdapter {
  return activeStorage
}

export async function getItemAsync(key: string): Promise<string | null> {
  const v = activeStorage.getItem(key)
  return v instanceof Promise ? await v : v
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  const r = activeStorage.setItem(key, value)
  if (r instanceof Promise) await r
}

export async function removeItemAsync(key: string): Promise<void> {
  const r = activeStorage.removeItem(key)
  if (r instanceof Promise) await r
}
