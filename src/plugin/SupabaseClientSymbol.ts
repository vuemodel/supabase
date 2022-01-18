import { SupabaseClient } from '@supabase/supabase-js'
import { InjectionKey } from 'vue-demi'

const SupabaseClientSymbol: InjectionKey<SupabaseClient> = Symbol('SupabaseDefaultClient')

export {
  SupabaseClientSymbol,
}
