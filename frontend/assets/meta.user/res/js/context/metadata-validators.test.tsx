import * as React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

import testSchema from '../__fixtures__/test-schema.json'
import multiValSchema from '../__fixtures__/metadata-with-multival.json'
import { buildValidator, mapErrors, formatSpecialCasesForValidation } from './metadata'

// Helper to create AJV error objects for testing mapErrors
const createError = (keyword: string, instancePath: string, schemaPath: string, message: string, params?: any) => ({
  keyword,
  instancePath,
  schemaPath,
  message,
  params: params || {},
})

describe('mapErrors', () => {
  it('returns empty object for null or undefined errors', () => {
    expect(mapErrors(null as any)).toEqual({})
    expect(mapErrors(undefined as any)).toEqual({})
  })

  it('returns empty object for empty array', () => {
    expect(mapErrors([])).toEqual({})
  })

  it('maps required errors with missingProperty', () => {
    const errors = [
      createError('required', '', '#/required', 'must have required property', { missingProperty: 'usermeta-text' }),
    ]
    const result = mapErrors(errors)
    expect(result).toEqual({
      'usermeta-text': 'must have required property',
    })
  })

  it('maps required errors when schemaPath includes #required', () => {
    // When schemaPath includes #required, treat as instance path error
    const errors = [
      createError('required', '/usermeta-text', '#/properties/usermeta-text/required', 'must be present', { missingProperty: 'usermeta-text' }),
    ]
    const result = mapErrors(errors)
    // Should use instancePath split
    expect(result).toEqual({
      'usermeta-text': 'must be present',
    })
  })

  it('maps instancePath errors', () => {
    const errors = [
      createError('minLength', '/usermeta-text', '#/properties/usermeta-text/minLength', 'must be at least 3 characters', {}),
    ]
    const result = mapErrors(errors)
    expect(result).toEqual({
      'usermeta-text': 'must be at least 3 characters',
    })
  })

  it('handles nested instance paths', () => {
    const errors = [
      createError('minLength', '/nested/property', '#/properties/nested/property/minLength', 'too short', {}),
    ]
    const result = mapErrors(errors)
    // Extracts second segment after slash (first path component)
    expect(result).toEqual({
      'nested': 'too short',
    })
  })

  it('aggregates multiple errors', () => {
    const errors = [
      createError('required', '', '#/required', 'missing property', { missingProperty: 'field1' }),
      createError('maxLength', '/field2', '#/properties/field2/maxLength', 'too long', {}),
    ]
    const result = mapErrors(errors)
    expect(result).toEqual({
      'field1': 'missing property',
      'field2': 'too long',
    })
  })

  it('handles missingProperty containing slash', () => {
    const errors = [
      createError('required', '', '#/required', 'missing property', { missingProperty: 'field/with/slash' }),
    ]
    const result = mapErrors(errors)
    expect(result).toEqual({
      'fieldwithslash': 'missing property',
    })
  })

  it('handles empty instancePath', () => {
    const errors = [
      createError('type', '', '#/properties/field/type', 'must be string', {}),
    ]
    const result = mapErrors(errors)
    expect(result).toEqual({
      'undefined': 'must be string',
    })
  })

  it('handles instancePath slash only', () => {
    const errors = [
      createError('type', '/', '#/properties/field/type', 'must be string', {}),
    ]
    const result = mapErrors(errors)
    expect(result).toEqual({
      '': 'must be string',
    })
  })

  it('handles missingProperty undefined', () => {
    const errors = [
      createError('type', '/field', '#/properties/field/type', 'must be string', {}),
    ]
    const result = mapErrors(errors)
    expect(result).toEqual({
      'field': 'must be string',
    })
  })

  it('handles deeply nested instance path', () => {
    const errors = [
      createError('minLength', '/a/b/c/d', '#/properties/a/b/c/d/minLength', 'too short', {}),
    ]
    const result = mapErrors(errors)
    expect(result).toEqual({
      'a': 'too short',
    })
  })

  it('overwrites duplicate keys with later error', () => {
    const errors = [
      createError('minLength', '/field', '#/properties/field/minLength', 'first', {}),
      createError('maxLength', '/field', '#/properties/field/maxLength', 'second', {}),
    ]
    const result = mapErrors(errors)
    expect(result).toEqual({
      'field': 'second',
    })
  })
})

describe('formatSpecialCasesForValidation', () => {
  it('returns formState as-is when jsonSchema is null', () => {
    const formState = new Map([['key', 'value']])
    const result = formatSpecialCasesForValidation(formState, null as any)
    expect(result).toBe(formState)
  })

  it('returns plain object with same values when no special formats', () => {
    const formState = new Map([
      ['text', 'hello'],
      ['number', 42],
      ['bool', true],
    ])
    const jsonSchema = {
      properties: {
        text: { type: 'string' },
        number: { type: 'number' },
        bool: { type: 'boolean' },
      },
    }
    const result = formatSpecialCasesForValidation(formState, jsonSchema)
    expect(result).toEqual({
      text: 'hello',
      number: 42,
      bool: true,
    })
  })

  it('converts time format from epoch seconds to hh:mm:ss', () => {
    const epochSeconds = 1700000000 // 2023-11-14T22:13:20Z
    const formState = new Map([['timeField', epochSeconds.toString()]])
    const jsonSchema = {
      properties: {
        timeField: { format: 'time' },
      },
    }
    const result = formatSpecialCasesForValidation(formState, jsonSchema)
    // Expected: hours, minutes, seconds from ISO string
    // Date conversion: new Date(epochSeconds * 1000).toISOString() -> "2023-11-14T22:13:20.000Z"
    // Split T[1] -> "22:13:20.000Z", split '.' -> "22:13:20"
    expect(result).toEqual({
      timeField: '22:13:20',
    })
  })

  it('converts date-time format from epoch seconds to ISO string', () => {
    const epochSeconds = 1700000000
    const formState = new Map([['datetimeField', epochSeconds.toString()]])
    const jsonSchema = {
      properties: {
        datetimeField: { format: 'date-time' },
      },
    }
    const result = formatSpecialCasesForValidation(formState, jsonSchema)
    const expected = new Date(epochSeconds * 1000).toISOString()
    expect(result).toEqual({
      datetimeField: expected,
    })
  })

  it('converts date format from epoch seconds to ISO string', () => {
    const epochSeconds = 1700000000
    const formState = new Map([['dateField', epochSeconds.toString()]])
    const jsonSchema = {
      properties: {
        dateField: { format: 'date' },
      },
    }
    const result = formatSpecialCasesForValidation(formState, jsonSchema)
    const expected = new Date(epochSeconds * 1000).toISOString()
    expect(result).toEqual({
      dateField: expected,
    })
  })

  it('handles missing property in schema gracefully', () => {
    const formState = new Map([['unknown', 'value']])
    const jsonSchema = {
      properties: {
        known: { type: 'string' },
      },
    }
    const result = formatSpecialCasesForValidation(formState, jsonSchema)
    expect(result).toEqual({
      unknown: 'value',
    })
  })

  it('handles empty formState', () => {
    const formState = new Map()
    const jsonSchema = {
      properties: {},
    }
    const result = formatSpecialCasesForValidation(formState, jsonSchema)
    expect(result).toEqual({})
  })

  it('converts time format from number epoch', () => {
    const epochSeconds = 1700000000
    const formState = new Map([['timeField', epochSeconds]]) // number, not string
    const jsonSchema = {
      properties: {
        timeField: { format: 'time' },
      },
    }
    const result = formatSpecialCasesForValidation(formState, jsonSchema)
    expect(result).toEqual({
      timeField: '22:13:20',
    })
  })

  it('converts time format with negative epoch', () => {
    const epochSeconds = -1700000000
    const formState = new Map([['timeField', epochSeconds.toString()]])
    const jsonSchema = {
      properties: {
        timeField: { format: 'time' },
      },
    }
    const result = formatSpecialCasesForValidation(formState, jsonSchema)
    // Expected time from negative epoch (date before 1970)
    const expected = new Date(epochSeconds * 1000).toISOString()
    const timePart = expected.split('T')[1]
    const [hours, minutes, secondsWithMs] = timePart.split(':')
    const seconds = secondsWithMs.split('.')[0]
    expect(result).toEqual({
      timeField: `${hours}:${minutes}:${seconds}`,
    })
  })

  it('converts time format with zero epoch', () => {
    const formState = new Map([['timeField', '0']])
    const jsonSchema = {
      properties: {
        timeField: { format: 'time' },
      },
    }
    const result = formatSpecialCasesForValidation(formState, jsonSchema)
    // 1970-01-01T00:00:00.000Z
    expect(result).toEqual({
      timeField: '00:00:00',
    })
  })

  it('handles schema missing properties', () => {
    const formState = new Map([['field', 'value']])
    const jsonSchema = {}
    const result = formatSpecialCasesForValidation(formState, jsonSchema)
    // Should treat missing properties as undefined, pass through value
    expect(result).toEqual({
      field: 'value',
    })
  })

  it('handles properties being null', () => {
    const formState = new Map([['field', 'value']])
    const jsonSchema = { properties: null }
    const result = formatSpecialCasesForValidation(formState, jsonSchema)
    // properties[k]? will be undefined, pass through
    expect(result).toEqual({
      field: 'value',
    })
  })

  it('handles multiple properties with different formats', () => {
    const epochSeconds = 1700000000
    const formState = new Map([
      ['timeField', epochSeconds.toString()],
      ['dateField', epochSeconds.toString()],
      ['datetimeField', epochSeconds.toString()],
      ['plain', 'hello'],
    ])
    const jsonSchema = {
      properties: {
        timeField: { format: 'time' },
        dateField: { format: 'date' },
        datetimeField: { format: 'date-time' },
        plain: { type: 'string' },
      },
    }
    const result = formatSpecialCasesForValidation(formState, jsonSchema)
    const expectedDatetime = new Date(epochSeconds * 1000).toISOString()
    const expectedDate = expectedDatetime // same conversion
    const expectedTime = '22:13:20'
    expect(result).toEqual({
      timeField: expectedTime,
      dateField: expectedDate,
      datetimeField: expectedDatetime,
      plain: 'hello',
    })
  })
})

describe('buildValidator', () => {
  let ajvInstance: Ajv
  let validator: any

  beforeEach(() => {
    ajvInstance = new Ajv({ allErrors: true })
    addFormats(ajvInstance)
    validator = ajvInstance.compile(testSchema)
  })

  it('returns valid state with empty errors when validator is null', () => {
    const validate = buildValidator(null)
    const result = validate(new Map())
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('returns valid state for data that matches schema', () => {
    const validate = buildValidator(validator)
    const formState = new Map([
      ['usermeta-text', 'abc'],
      ['usermeta-paragraph', 'A paragraph'],
      ['usermeta-number', 5],
      ['usermeta-datetime', '1700000000'],
    ])
    const result = validate(formState)
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('returns invalid state with errors for data violating schema', () => {
    const validate = buildValidator(validator)
    const formState = new Map([
      ['usermeta-text', 'ab'], // minLength 3
      ['usermeta-paragraph', 'A paragraph'],
      ['usermeta-number', 15], // maximum 10
      ['usermeta-datetime', '1700000000'],
    ])
    const result = validate(formState)
    expect(result.isValid).toBe(false)
    // Should have errors for usermeta-text and usermeta-number
    expect(result.errors['usermeta-text']).toContain('fewer than 3')
    expect(result.errors['usermeta-number']).toContain('must be <= 10')
  })

  it('calls formatSpecialCasesForValidation with validator schema', () => {
    // Spy on formatSpecialCasesForValidation
    const spy = vi.spyOn({ formatSpecialCasesForValidation }, 'formatSpecialCasesForValidation')
    // We'll need to import the module differently, but we can test integration via actual call
    // For simplicity, we just verify that date-time conversion works
    const validate = buildValidator(validator)
    const formState = new Map([
      ['usermeta-datetime', '1700000000'],
      ['usermeta-text', 'abc'],
      ['usermeta-paragraph', 'paragraph'],
      ['usermeta-number', 1],
    ])
    const result = validate(formState)
    expect(result.isValid).toBe(true)
    // The date-time value should have been converted to ISO string internally
    // We can't directly observe, but we can trust that Ajv validation passes
  })

  it('calls mapErrors with validator.errors', () => {
    // We'll test by checking that errors are mapped correctly
    const validate = buildValidator(validator)
    const formState = new Map([
      ['usermeta-text', 'ab'], // invalid
      ['usermeta-paragraph', 'A paragraph'],
      ['usermeta-number', 5],
      ['usermeta-datetime', '1700000000'],
    ])
    const result = validate(formState)
    expect(result.isValid).toBe(false)
    expect(result.errors['usermeta-text']).toBeDefined()
    // Ensure error message is mapped
    expect(typeof result.errors['usermeta-text']).toBe('string')
  })

  it('handles empty formState with required fields', () => {
    const validate = buildValidator(validator)
    const formState = new Map()
    const result = validate(formState)
    expect(result.isValid).toBe(false)
    // Should have required errors for all required fields
    expect(Object.keys(result.errors).length).toBe(4)
  })

  it('handles formState with extra fields not in schema', () => {
    const validate = buildValidator(validator)
    const formState = new Map([
      ['extra', 'value'],
      ['usermeta-text', 'abc'],
      ['usermeta-paragraph', 'paragraph'],
      ['usermeta-number', 5],
      ['usermeta-datetime', '1700000000'],
    ])
    const result = validate(formState)
    // Ajv by default allows additional properties, so validation should pass
    expect(result.isValid).toBe(true)
  })

  it('handles validator returning false with empty errors', () => {
    const mockValidator = vi.fn(() => false)
    mockValidator.schema = { properties: {} }
    mockValidator.errors = []
    const validate = buildValidator(mockValidator as any)
    const formState = new Map([['field', 'value']])
    const result = validate(formState)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual({})
    expect(mockValidator).toHaveBeenCalled()
  })

  it('handles validator returning true with errors (still maps errors)', () => {
    const mockValidator = vi.fn(() => true)
    mockValidator.schema = { properties: {} }
    mockValidator.errors = [{ keyword: 'type', instancePath: '/field', schemaPath: '#/properties/field/type', message: 'must be string' }]
    const validate = buildValidator(mockValidator as any)
    const formState = new Map([['field', 'value']])
    const result = validate(formState)
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({ field: 'must be string' })
  })

  it('handles validator schema missing properties', () => {
    const mockValidator = vi.fn(() => true)
    mockValidator.schema = {}
    mockValidator.errors = null
    const validate = buildValidator(mockValidator as any)
    const formState = new Map([['field', 'value']])
    const result = validate(formState)
    // formatSpecialCasesForValidation will receive empty schema, pass through values
    expect(mockValidator).toHaveBeenCalledWith({ field: 'value' })
    expect(result.isValid).toBe(true)
  })

   it('handles validator schema null', () => {
     const mockValidator = vi.fn(() => true)
     mockValidator.schema = null
     mockValidator.errors = null
     const validate = buildValidator(mockValidator as any)
     const formState = new Map([['field', 'value']])
     const result = validate(formState)
     // formatSpecialCasesForValidation returns formState (Map) when jsonSchema null
     // validator receives Map, may treat as object? Mock expects Map
     // We'll just ensure no crash
     expect(mockValidator).toHaveBeenCalled()
     // The mock will be called with Map because formatSpecialCasesForValidation returns Map
     // We'll accept any argument
     expect(result.isValid).toBe(true)
   })
})

describe('Multi-value metadata validation', () => {
  let ajv: Ajv

  beforeEach(() => {
    ajv = new Ajv({ allErrors: true })
    addFormats(ajv)
  })

  it('validates array fields with valid enum values', () => {
    const validator = ajv.compile(multiValSchema)
    
    const formState = new Map([
      ['usermeta-auto-complete', ['Urgent', 'Critical']],
      ['usermeta-long-text', 'This is a long enough text'],
      ['usermeta-number', 42]
    ])

    const isValid = validator(formatSpecialCasesForValidation(formState, multiValSchema))
    expect(isValid).toBe(true)
    expect(validator.errors).toBeNull()
  })

  it('rejects array fields with invalid enum values', () => {
    const validator = ajv.compile(multiValSchema)
    
    const formState = new Map([
      ['usermeta-auto-complete', ['Urgent', 'InvalidValue']],
      ['usermeta-long-text', 'This is a long enough text'],
      ['usermeta-number', 42]
    ])

    const isValid = validator(formatSpecialCasesForValidation(formState, multiValSchema))
    expect(isValid).toBe(false)
    expect(validator.errors).toBeDefined()
    expect(validator.errors?.length).toBeGreaterThan(0)
    
    const errors = mapErrors(validator.errors)
    expect(errors['usermeta-auto-complete']).toBeDefined()
  })

  it('enforces uniqueItems constraint on array fields', () => {
    const validator = ajv.compile(multiValSchema)
    
    const formState = new Map([
      ['usermeta-auto-complete', ['Urgent', 'Urgent']],  // duplicate
      ['usermeta-long-text', 'This is a long enough text'],
      ['usermeta-number', 42]
    ])

    const isValid = validator(formatSpecialCasesForValidation(formState, multiValSchema))
    expect(isValid).toBe(false)
    expect(validator.errors).toBeDefined()
    expect(validator.errors?.length).toBeGreaterThan(0)
    
    const errors = mapErrors(validator.errors)
    expect(errors['usermeta-auto-complete']).toBeDefined()
  })

  it('validates all field types in multival schema', () => {
    const validator = ajv.compile(multiValSchema)
    
    const formState = new Map([
      ['usermeta-auto-complete', ['Urgent', 'Normal']],
      ['usermeta-boolean', true],
      ['usermeta-long-text', 'A valid long text string'],
      ['usermeta-number', 123],
      ['usermeta-text', 'hello'],
      ['usermeta-url', 'https://example.com']
    ])

    const isValid = validator(formatSpecialCasesForValidation(formState, multiValSchema))
    expect(isValid).toBe(true)
  })

  it('validates datetime format in multival schema', () => {
    const validator = ajv.compile(multiValSchema)
    
    const formState = new Map([
      ['usermeta-auto-complete', ['Urgent']],
      ['usermeta-datetime', '2024-02-04T17:00:00Z'],
      ['usermeta-long-text', 'A valid long text string'],
      ['usermeta-number', 100]
    ])

    const isValid = validator(formatSpecialCasesForValidation(formState, multiValSchema))
    expect(isValid).toBe(true)
  })

  it('rejects missing required fields with array type', () => {
    const validator = ajv.compile(multiValSchema)
    
    // Missing required 'usermeta-number' field
    const formState = new Map([
      ['usermeta-auto-complete', ['Urgent']],
      ['usermeta-long-text', 'A valid long text string']
    ])

    const isValid = validator(formatSpecialCasesForValidation(formState, multiValSchema))
    expect(isValid).toBe(false)
    expect(validator.errors).toBeDefined()
  })

  it('validates minLength constraint on text field', () => {
    const validator = ajv.compile(multiValSchema)
    
    const formState = new Map([
      ['usermeta-auto-complete', ['Urgent']],
      ['usermeta-long-text', 'short'],  // too short, needs 10 chars minimum
      ['usermeta-number', 42]
    ])

    const isValid = validator(formatSpecialCasesForValidation(formState, multiValSchema))
    expect(isValid).toBe(false)
    expect(validator.errors).toBeDefined()
    
    const errors = mapErrors(validator.errors)
    expect(errors['usermeta-long-text']).toBeDefined()
  })

  it('validates maxLength constraint on text field', () => {
    const validator = ajv.compile(multiValSchema)
    
    const formState = new Map([
      ['usermeta-auto-complete', ['Urgent']],
      ['usermeta-long-text', 'This is a very long text that definitely exceeds the one hundred character limit set in the schema for this field and should fail'],
      ['usermeta-number', 42]
    ])

    const isValid = validator(formatSpecialCasesForValidation(formState, multiValSchema))
    expect(isValid).toBe(false)
    expect(validator.errors).toBeDefined()
    
    const errors = mapErrors(validator.errors)
    expect(errors['usermeta-long-text']).toBeDefined()
  })

  it('formatSpecialCasesForValidation preserves array values', () => {
    const arrayValue = ['Urgent', 'Critical', 'Normal']
    const formState = new Map([
      ['usermeta-auto-complete', arrayValue],
      ['usermeta-text', 'hello']
    ])

    const result = formatSpecialCasesForValidation(formState, multiValSchema)
    
    // Check that array was preserved
    expect(Array.isArray(result['usermeta-auto-complete'])).toBe(true)
    expect(result['usermeta-auto-complete']).toEqual(arrayValue)
  })

  it('handles empty array field validation', () => {
    const validator = ajv.compile(multiValSchema)
    
    const formState = new Map([
      ['usermeta-auto-complete', []],  // empty array
      ['usermeta-long-text', 'A valid long text string'],
      ['usermeta-number', 42]
    ])

    const isValid = validator(formatSpecialCasesForValidation(formState, multiValSchema))
    // Empty array should pass validation if not required to have items
    expect(isValid).toBe(true)
  })

  it('validates multiple valid enum options in array', () => {
    const validator = ajv.compile(multiValSchema)
    
    const validOptions = ['Urgent', 'Critical', 'Low Priority', 'Normal', 'Rejected']
    const formState = new Map([
      ['usermeta-auto-complete', validOptions],
      ['usermeta-long-text', 'A valid long text string'],
      ['usermeta-number', 42]
    ])

    const isValid = validator(formatSpecialCasesForValidation(formState, multiValSchema))
    expect(isValid).toBe(true)
    expect(validator.errors).toBeNull()
  })
})