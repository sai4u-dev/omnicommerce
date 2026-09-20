const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const TOKEN_KEY = 'vendor_token'
const USER_KEY = 'vendor_user'
export function getToken(){ return localStorage.getItem(TOKEN_KEY) }
export function setAuth(token, user){ localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)) }
export function clearAuth(){ localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY) }
export async function apiFetch(path, { method='GET', body, auth=false, headers={}}={}){
  const opts={ method, headers:{ 'Content-Type':'application/json', 'x-app-type':'web', 'x-app-role':'vendor', ...headers } }
  if(auth){ const t=getToken(); if(t) opts.headers.Authorization=`Bearer ${t}` }
  if(body) opts.body=JSON.stringify(body)
  const res=await fetch(`${API}${path}`, opts)
  const data=await res.json().catch(()=>({}))
  if(!res.ok){ const msg=data.error||data.message||`Request failed ${res.status}`; const err=new Error(msg); err.status=res.status; err.data=data; throw err }
  return data
}
export { API }
