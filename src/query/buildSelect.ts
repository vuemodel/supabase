import deepmerge from 'deepmerge'
const { all: mergeAll } = deepmerge
import { drop, set } from 'lodash-es'

function dotRelationStringArrayToArray (dotRelations: string[]) {
  return dotRelations.map(dotRelation => {
    return dotRelation.split('.')
  })
}

function relationsArrayToObject (relationsArray: Array<string[]>) {
  const result: object[] = []
  relationsArray.forEach((relations) => {
    const nest: Record<string, object> = {}
    nest[relations[0]] = {}
    let path = relations[0]
    drop(relations).forEach((relation: string) => {
      path += '.' + relation
      set(nest, path, {})
    })
    result.push(nest)
  })
  
  return mergeAll(result) as Record<string, object>
}

function buildSelectFromRelationsObject (relationsObject: Record<string, object>) {
  let result = '*,'
  function buildQueryPart(
    children: Record<string, object>,
    key: string | null = null,
    parentChildren = {},
    siblingNumber = 0
  ) {
    if (key) {
      result += key + '(*'
    }

    if (key && Object.keys(children).length) {
      result += ','
    }

    Object.keys(children).forEach((newKey, index) => {
      buildQueryPart(children[newKey] as Record<string, object>, newKey, children, index)
    })

    if (key) {
      result += ')'
    }

    if (Object.keys(parentChildren).length > 1 && (siblingNumber + 1) < Object.keys(parentChildren).length) {
      result += ','
    }
  }
  buildQueryPart(relationsObject)
  return result
}

export default function buildSelect (include: undefined | string[]) {
  if (!include || (Array.isArray(include) && include.length < 1)) {
    return undefined
  }
  const asArrayOfRelationArrays = dotRelationStringArrayToArray(include)
  const asMergedRelationsObject = relationsArrayToObject(asArrayOfRelationArrays)
  return buildSelectFromRelationsObject(asMergedRelationsObject)
}
