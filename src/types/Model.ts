import { Model as VuexOrmModel } from '@vuex-orm/core'

export class Model extends VuexOrmModel {
  [k: string]: any;
  id: string | number | undefined
}