import Ajv, { AnySchema } from 'ajv'
import addFormats from 'ajv-formats'
import { localizeAjvError } from '../../utils/ajvErrorLocalization'

const translateValidationKey = (key: string) => {
    const messageHash = (globalThis as any)?.pydio?.MessageHash
    if (!messageHash) return undefined

    return messageHash[key] || messageHash[key.replace(/^meta\.user\./, '')]
}

export const mapErrors = (errors: any[]) => {
    if (!errors) return {}

    return errors.reduce((acc: {[key: string]: string}, e: any) => {
        const params = e.params || {}
        if (!e.schemaPath.includes('#required') && params.missingProperty) {
            const key = params.missingProperty.replace(/\//g, '')
            return { ...acc, [key]: localizeAjvError(e, translateValidationKey) }
        }

        const [, type,] = e.instancePath.split('/')
        return { ...acc, [type]: localizeAjvError(e, translateValidationKey) }
    }, {})
}

export const formatSpecialCasesForValidation = (formState: Map<string, any>, jsonSchema: AnySchema) => {
    if (!jsonSchema) return formState

    const { properties } = jsonSchema
    const safeProperties = properties || {}
    const entries = {}
    formState.forEach((v, k) => {
        if (safeProperties[k]?.format === 'time') {
            const iso = new Date(parseFloat(v) * 1000).toISOString();
            const timePart = iso.split('T')[1];
            const [hours, minutes, secondsWithMs] = timePart.split(':');
            const seconds = secondsWithMs.split('.')[0];
            entries[k] = `${hours}:${minutes}:${seconds}`;
            return
        }

        if (safeProperties[k]?.format === 'date-time' || safeProperties[k]?.format === 'date') {
            if (!v) return
            entries[k] = new Date(parseFloat(v) * 1000).toISOString()
            return
        }

        entries[k] = v
    })

    return entries
}

export type Validator = (formState: Map<string, any>) => {
    isValid: boolean
    errors: any
}

/**
 * Options for configuring validator behavior
 */
export interface BuildValidatorOptions {
    /**
     * When true, AJV applies schema defaults to missing/empty properties.
     * Defaults: false
     * Use case: "Prompt on Upload" to auto-fill metadata fields
     *
     * AJV's `useDefaults: "empty"` automatically applies defaults from the schema to any
     * properties with empty values (null, undefined, "", []) during validation.
     */
    applyDefaults?: boolean;
}

export const newValidator = (schema: AnySchema, options?: BuildValidatorOptions) => {
    const ajv = new Ajv({
        allErrors: true,
        useDefaults: options?.applyDefaults ? "empty" : false,
    })
    addFormats(ajv)
    return ajv.compile(schema)
}

/**
 * Creates a validator function for a JSON schema.
 *
 * AJV's `useDefaults: "empty"` automatically applies defaults from the schema to any
 * properties with empty values (null, undefined, "", []) during validation.
 *
 * When applyDefaults=true: AJV uses `useDefaults: "empty"` to apply defaults during validation
 * When applyDefaults=false: AJV uses `useDefaults: false` to skip defaults during validation
 */
export const buildValidator = (
    schema: AnySchema | null,
    options?: BuildValidatorOptions
): Validator => {
    if (!schema) return (formState: Map<string, any>) => ({ isValid: true, errors: {} })

    const validator = newValidator(schema, options ?? {})

    return (formState: Map<string, any>) => {
        // Validate and apply defaults conditionally
        const isValid = validator(
            formatSpecialCasesForValidation(
                formState,
                schema
            )
        )
        const errors = mapErrors(validator.errors)

        return { isValid, errors }
    }
}
