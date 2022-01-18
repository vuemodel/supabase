import { useModelApi } from './useModelApi'
import { ref, computed, Ref, ComputedRef } from 'vue-demi'
import { Collection, InstanceOf } from '@vuex-orm/core'
import { Model } from '../types'
import { ApiError, PostgrestError } from '@supabase/supabase-js'

export interface UseModelCollectionReturn<M extends typeof Model> {
  index: () => void
  ids: Ref<string[] | number[]>
  collection: ComputedRef<Collection<InstanceOf<M>>>
  error: Ref<ApiError | PostgrestError | null>
  indexing: Ref<boolean>
}

export function useModelCollection<M extends typeof Model> (
  ModelClass: M
): UseModelCollectionReturn<M> {
  const modelApi = useModelApi(ModelClass)
  const ids = ref()

  const collection = computed<Collection<InstanceOf<M>>>(() => {
    if (Array.isArray(ids.value)) {
      return ModelClass.query().whereIdIn(ids.value).get()
    }

    return ModelClass.all()
  })

  async function index () {
    await modelApi.index()
  }

  return {
    index,
    ids,
    collection,
    error: modelApi.error,
    indexing: modelApi.indexing
  }
}