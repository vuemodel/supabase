import { SupabaseClient } from '@supabase/supabase-js'
import { inject } from 'vue-demi'
import { SupabaseClientSymbol } from '../plugin/SupabaseClientSymbol'

export const useClient = (): SupabaseClient => {
  const client = inject(SupabaseClientSymbol)
  if (!client) {
    throw Error('Error injecting supabase client')
  }
  return client
}
