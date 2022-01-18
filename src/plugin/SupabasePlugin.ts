import { App } from 'vue-demi'
import { createClient } from '@supabase/supabase-js'
import { SupabaseClientSymbol } from './SupabaseClientSymbol'

export interface VuePluginOptions {
  credentials: {
    supabaseUrl: string,
    supabaseKey: string
  }
}

export const SupabasePlugin = {
  install: (vueApp: App, options: VuePluginOptions): void => {
    if (!options || !options.credentials || !options.credentials.supabaseKey || !options.credentials.supabaseUrl) {
      throw Error('Credentials must be provided when installing supabase')
    }
    const { supabaseUrl, supabaseKey } = options.credentials
    const client = createClient(supabaseUrl, supabaseKey)

    vueApp.provide(SupabaseClientSymbol, client)
  }
}

export default SupabasePlugin
