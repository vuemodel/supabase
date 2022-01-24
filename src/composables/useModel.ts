import { ApiError, PostgrestError } from '@supabase/supabase-js'
import { useModelApi } from './useModelApi'
import { ref, computed, watch, Ref, ComputedRef } from 'vue-demi'
import { InstanceOf, Item } from '@vuex-orm/core'
import { Model } from '../types'
import { StandardError } from './useApi'
import QueryBuilder from '../query/QueryBuilder'

export interface UseModelReturn<M extends typeof Model> {
  create: (customForm?: Partial<any>) => Promise<void>
  find: () => Promise<void>
  update: () => Promise<void>
  remove: () => Promise<void>
  query: QueryBuilder
  model: ComputedRef<Item<InstanceOf<M>>>
  form: Partial<any>
  resetForm: () => void
  id: Ref<string | number | null>
  error: Ref<ApiError | PostgrestError | StandardError | null>
  creating: Ref<boolean>
  finding: Ref<boolean>
  updating: Ref<boolean>
  removing: Ref<boolean>
  loading: Ref<boolean>
}

const ignoreOnUpdateFields = [
  'id', 'created_at'
]

export function useModel<M extends typeof Model>(
  ModelClass: M
): UseModelReturn<M> {
  const modelApi = useModelApi<M>(ModelClass)

  const id = ref()

  const model = computed<Item<InstanceOf<M>>>(() => {
    return ModelClass.find<M>(id.value)
  })

  function getUpdateableFieldKeys () {
    const fields = ModelClass.getFields()
    return Object.keys(fields)
      .filter(field => {
        return !ignoreOnUpdateFields.includes(field)
      })
  }

  const form = ref<Partial<any>>({})

  function resetFormToNulls () {
    getUpdateableFieldKeys().forEach(key => {
      const fields = ModelClass.getFields()
      form.value[key] = fields[key].value
    })
  }

  function resetFormToModel () {
    getUpdateableFieldKeys().forEach(key => {
      form.value[key] = model.value?.[key]
    })
  }

  function resetForm () {
    if (model.value) {
      resetFormToModel()
    } else {
      resetFormToNulls()
    }
  }

  watch(model, () => {
    resetForm()
  }, { immediate: true })

  async function create (customForm?: Partial<any>) {
    if(customForm) {
      await modelApi.create(customForm)
    } else {
      await modelApi.create(form.value)
    }
    id.value = modelApi.data?.value?.id
  }

  async function find () {
    await modelApi.find(id.value)
  }

  async function update () {
    if (!id.value) {
      modelApi.error.value = {
        status: 0,
        message: 'no id has been set'
      }
      return
    }
    await modelApi.update(id.value, form.value)
  }

  async function remove () {
    if (!id.value) {
      modelApi.error.value = {
        status: 0,
        message: 'no id has been set'
      }
      return
    }
    await modelApi.remove(id.value)
    id.value = null
  }

  return {
    create,
    find,
    update,
    remove,
    model,
    form,
    resetForm,
    id,
    query: modelApi.query,
    error: modelApi.error,
    creating: modelApi.creating,
    finding: modelApi.finding,
    updating: modelApi.updating,
    removing: modelApi.removing,
    loading: modelApi.loading
  }
}
