import { describe, it, expect } from 'vitest';
import { parseTagsValue, formatTagsArrayToString } from './mapTags';

describe('parseTagsValue', () => {
    it('parses a comma-separated string', () => {
        expect(parseTagsValue('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('parses a JSON array string', () => {
        expect(parseTagsValue('["a","b","c"]')).toEqual(['a', 'b', 'c']);
    });

    it('handles a plain array directly', () => {
        expect(parseTagsValue(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('trims whitespace from tags', () => {
        expect(parseTagsValue('a, b ,  c  ')).toEqual(['a', 'b', 'c']);
    });

    it('filters out empty and whitespace-only tags', () => {
        expect(parseTagsValue('a, , b,  ,c')).toEqual(['a', 'b', 'c']);
    });

    it('returns an empty array for an empty string', () => {
        expect(parseTagsValue('')).toEqual([]);
    });

    it('returns an empty array for null', () => {
        expect(parseTagsValue(null)).toEqual([]);
    });

    it('returns an empty array for undefined', () => {
        expect(parseTagsValue(undefined)).toEqual([]);
    });

    it('falls back to comma-split on malformed JSON', () => {
        expect(parseTagsValue('[invalid json')).toEqual(['[invalid json']);
    });

    it('filters empty strings out of a plain array', () => {
        expect(parseTagsValue(['a', '', 'b'])).toEqual(['a', 'b']);
    });
});

describe('formatTagsArrayToString', () => {
    it('joins an array into a comma-separated string', () => {
        expect(formatTagsArrayToString(['a', 'b', 'c'])).toBe('a,b,c');
    });

    it('filters out empty values', () => {
        expect(formatTagsArrayToString(['a', '', 'c'])).toBe('a,c');
    });

    it('parses a JSON string input', () => {
        expect(formatTagsArrayToString('["a","b","c"]')).toBe('a,b,c');
    });

    it('unwraps a single-element array wrapping a JSON string', () => {
        expect(formatTagsArrayToString(['["a","b","c"]'])).toBe('a,b,c');
    });

    it('returns an empty string for an empty array', () => {
        expect(formatTagsArrayToString([])).toBe('');
    });
});
