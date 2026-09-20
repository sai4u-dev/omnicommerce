import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'
export const TOKEN_KEY = 'velora_user_token'
export const USER_KEY = 'velora_user'

async function getToken() {
  try {
    let t = await SecureStore.getItemAsync(TOKEN_KEY)
    if (!t) t = await AsyncStorage.getItem(TOKEN_KEY)
    return t
  } catch { return null }
}
async function setAuth(token, user) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token)
    await AsyncStorage.setItem(TOKEN_KEY, token)
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (e) { console.warn('setAuth failed', e) }
}
async function clearAuth() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    await AsyncStorage.removeItem(TOKEN_KEY)
    await AsyncStorage.removeItem(USER_KEY)
  } catch {}
}

export async function apiFetch(path, { method='GET', body, auth=false, headers={}, params }={}) {
  let url = `${API}${path}`
  if (params) {
    const qs = new URLSearchParams()
    for (const [k,v] of Object.entries(params)) if(v!=null && v!=='') qs.set(k, String(v))
    const s=qs.toString(); if(s) url+=`?${s}`
  }
  const opts={ method, headers:{ 'Content-Type':'application/json', 'x-app-type':'mobile', 'x-app-role':'user', ...headers } }
  if(auth){
    const t=await getToken()
    if(t) opts.headers.Authorization=`Bearer ${t}`
  }
  if(body) opts.body=JSON.stringify(body)
  const res=await fetch(url, opts)
  const text=await res.text()
  let data={}
  try{ data=text?JSON.parse(text):{} }catch{ data={raw:text}}
  if(!res.ok){
    const msg=data.error||data.message||`Request failed ${res.status}`
    const err=new Error(msg); err.status=res.status; err.data=data; throw err
  }
  return data
}

export { API, getToken, setAuth, clearAuth }
