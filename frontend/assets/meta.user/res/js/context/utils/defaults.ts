import { AnySchema } from 'ajv'

const hasOwn = (obj: any, key: string) => Object.prototype.hasOwnProperty.call(obj, key)

const isEmpty = (value: any) =>
    value === null
    || value === undefined
    || (typeof value === 'string' && value.trim().length === 0)
    || (Array.isArray(value) && value.length === 0)

export const mergeOptionalSchemaDefaults = (
    formState: Map<string, any>,
    jsonSchema: AnySchema | null,
) => {
    if (!jsonSchema || typeof jsonSchema !== 'object') return new Map(formState)

    const nextState = new Map(formState)
    const schema = jsonSchema as any
    const properties = schema.properties && typeof schema.properties === 'object'
        ? schema.properties
        : {}

    Object.entries(properties).forEach(([fieldName, definition]) => {
        if (!definition || typeof definition !== 'object') return
        if (!hasOwn(definition, 'default')) return

        if (isEmpty(nextState.get(fieldName))) {
            nextState.set(fieldName, (definition as any).default)
        }
    })

    return nextState
}
