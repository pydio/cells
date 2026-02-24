import { describe, expect, it } from 'vitest';

import {
    parseErrors,
    parseValueForValidation,
} from './jsonSchema';

describe('parseValueForValidation', () => {
    it('converts epoch seconds to ISO string for date-time formats', () => {
        const schema = { format: 'date-time' };
        const epochSeconds = 1_700_000_000;

        const result = parseValueForValidation(schema, epochSeconds);

        expect(result).toBe(new Date(epochSeconds * 1000).toISOString());
    });

    it('returns original value when format is not date-time', () => {
        const schema = { format: 'string' };
        const value = 'raw-value';

        expect(parseValueForValidation(schema, value)).toBe(value);
    });
});

describe('parseErrors', () => {
    it('maps ajv errors to namespace keyed object', () => {
        const errors = [
            { keyword: 'required', params: { missingProperty: 'preferences' }, message: 'is required' },
            { keyword: 'type', instancePath: '/profile', message: 'must be a string' },
            { keyword: 'type', instancePath: '/profile/name', message: 'must be a string' },
        ];

        const result = parseErrors(errors);

        expect(result).toEqual({
            preferences: 'is required',
            profile: 'must be a string',
            'profile/name': 'must be a string',
        });
    });
});
