import { describe, it, expect } from 'vitest'
import { mergeOptionalSchemaDefaults } from './defaults'

describe('mergeOptionalSchemaDefaults', () => {
    it('fills missing required and optional fields from explicit defaults', () => {
        const schema = {
            type: 'object',
            required: ['requiredField'],
            properties: {
                requiredField: { type: 'string', default: 'required-default' },
                optionalField: { type: 'string', default: 'optional-default' },
            },
        }
        const formState = new Map()

        const result = mergeOptionalSchemaDefaults(formState, schema as any)

        expect(result.get('requiredField')).toBe('required-default')
        expect(result.get('optionalField')).toBe('optional-default')
    })

    it('does not override existing required field values', () => {
        const schema = {
            type: 'object',
            required: ['requiredField'],
            properties: {
                requiredField: { type: 'string', default: 'required-default' },
            },
        }
        const formState = new Map([['requiredField', 'provided']])

        const result = mergeOptionalSchemaDefaults(formState, schema as any)

        expect(result.get('requiredField')).toBe('provided')
    })

    it('does not override non-empty values already present', () => {
        const schema = {
            type: 'object',
            properties: {
                optionalField: { type: 'string', default: 'optional-default' },
            },
        }
        const formState = new Map([['optionalField', 'existing']])

        const result = mergeOptionalSchemaDefaults(formState, schema as any)

        expect(result.get('optionalField')).toBe('existing')
    })

    it('fills empty values only when defaults are explicitly set', () => {
        const schema = {
            type: 'object',
            properties: {
                noDefaultField: { type: 'string' },
                optionalString: { type: 'string', default: 'optional-default' },
                optionalArray: { type: 'array', default: ['a'] },
            },
        }
        const formState = new Map([
            ['optionalString', ''],
            ['optionalArray', []],
            ['noDefaultField', ''],
        ])

        const result = mergeOptionalSchemaDefaults(formState, schema as any)

        expect(result.get('optionalString')).toBe('optional-default')
        expect(result.get('optionalArray')).toEqual(['a'])
        expect(result.get('noDefaultField')).toBe('')
    })
})
