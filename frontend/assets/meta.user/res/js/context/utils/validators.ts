import { AnySchema, ValidateFunction } from 'ajv'

export const mapErrors = (errors: any[]) => {
    if (!errors) return {}

    return errors.reduce((acc: {[key: string]: string}, e: any) => {
        const params = e.params || {}
        if (!e.schemaPath.includes('#required') && params.missingProperty) {
            const key = params.missingProperty.replace(/\//g, '')
            return { ...acc, [key]: e.message }
        }

        const [, type,] = e.instancePath.split('/')
        return { ...acc, [type]: e.message }
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

export type Validator = (formState: Map<string, any>) => { isValid: boolean, errors: any }

export const buildValidator = (
    validator: ValidateFunction<any> | null
): Validator => (formState: Map<string, any>) => {
    if (!validator) return { isValid: true, errors: {} };

    let isValid = validator(
        formatSpecialCasesForValidation(
            formState,
            validator.schema
        )
    )
    const errors = mapErrors(validator.errors)
    return { isValid, errors }
}
