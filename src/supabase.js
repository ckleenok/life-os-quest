import { createClient } from '@supabase/supabase-js'

function getSupabaseUrl(value) {
  if (!value) return null
  if (/^https?:\/\//.test(value)) return value
  if (/^[a-z0-9]{20,}$/.test(value)) return `https://${value}.supabase.co`
  return null
}

const supabaseUrl = getSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function fetchUserState(userId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('user_states')
    .select('state')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data?.state ?? null
}

export async function upsertUserState(userId, state) {
  if (!supabase) return
  const { error } = await supabase
    .from('user_states')
    .upsert({ user_id: userId, state, updated_at: new Date().toISOString() })

  if (error) throw error
}
