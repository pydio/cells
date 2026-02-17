/*
 * Copyright 2026 Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { textToDate, dateToTimestamp } from './dateTimeConversion'

describe('dateTimeConversion', () => {
    beforeEach(() => {
        // Mock Date to use fixed timezone (UTC)
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2024-02-10T00:00:00Z'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('textToDate', () => {
        it('should convert timestamp string to Date', () => {
            const timestamp = '1707550800' // 2024-02-10 10:00:00 UTC
            const result = textToDate(timestamp)
            expect(result).toBeInstanceOf(Date)
            expect(result?.getTime()).toBe(1707550800000)
        })

        it('should return null for empty string', () => {
            expect(textToDate('')).toBeNull()
        })

        it('should return null for invalid timestamp', () => {
            expect(textToDate('invalid')).toBeNull()
            expect(textToDate('abc123')).toBeNull()
        })

        it('should reject epoch timestamp 0 (January 1, 1970)', () => {
            // Epoch 0 should be rejected as a defensive measure against default values
            const result = textToDate('0')
            expect(result).toBeNull()
        })

        it('should handle floating point timestamps', () => {
            const timestamp = '1707550800.5'
            const result = textToDate(timestamp)
            expect(result).toBeInstanceOf(Date)
            expect(result?.getTime()).toBe(1707550800500)
        })
    })

    describe('dateToTimestamp', () => {
        it('should convert Date object to timestamp string', () => {
            const date = new Date(1707550800000)
            const result = dateToTimestamp(date)
            expect(result).toBe('1707550800')
        })

        it('should convert date string to timestamp string', () => {
            const date = new Date(1707550800000)
            const dateStr = date.toISOString()
            const result = dateToTimestamp(dateStr)
            expect(result).toBe('1707550800')
        })

        it('should return empty string for null', () => {
            expect(dateToTimestamp(null)).toBe('')
        })

        it('should return empty string for undefined', () => {
            expect(dateToTimestamp(undefined)).toBe('')
        })

        it('should return empty string for invalid Date', () => {
            const invalidDate = new Date('invalid')
            expect(dateToTimestamp(invalidDate)).toBe('')
        })

        it('should return empty string for invalid date string', () => {
            expect(dateToTimestamp('not a date')).toBe('')
        })

        it('should handle non-Date objects', () => {
            expect(dateToTimestamp({} as any)).toBe('')
        })

        it('should reject epoch timestamp 0 (January 1, 1970)', () => {
            // Epoch 0 should be rejected as a defensive measure against default values
            const epochDate = new Date(0)
            const result = dateToTimestamp(epochDate)
            expect(result).toBe('')
        })

        it('should reject epoch timestamp 0 from string input', () => {
            // Epoch 0 should be rejected as a defensive measure against default values
            const result = dateToTimestamp('1970-01-01T00:00:00Z')
            expect(result).toBe('')
        })
    })

    describe('round-trip conversion', () => {
        it('should preserve timestamp through round-trip textToDate -> dateToTimestamp', () => {
            const originalTimestamp = '1707550800'
            const date = textToDate(originalTimestamp)
            const result = dateToTimestamp(date)
            expect(result).toBe(originalTimestamp)
        })

        it('should handle multiple round-trips correctly', () => {
            const timestamp1 = '1707550800'
            const date1 = textToDate(timestamp1)
            const timestamp2 = dateToTimestamp(date1)
            const date2 = textToDate(timestamp2)
            const timestamp3 = dateToTimestamp(date2)
            expect(timestamp3).toBe(timestamp1)
        })

        it('should preserve timestamp for large values', () => {
            const largeTimestamp = '9999999999' // Year 2286
            const date = textToDate(largeTimestamp)
            const result = dateToTimestamp(date)
            expect(result).toBe(largeTimestamp)
        })

        it('should preserve timestamp for small positive values', () => {
            const smallTimestamp = '1'
            const date = textToDate(smallTimestamp)
            const result = dateToTimestamp(date)
            expect(result).toBe(smallTimestamp)
        })
    })

    describe('edge cases and validation', () => {
        it('should handle timestamps with leading zeros', () => {
            const timestamp = '01707550800'
            const result = textToDate(timestamp)
            expect(result).not.toBeNull()
            expect(result?.getTime()).toBe(1707550800000)
        })

        it('should handle timestamps with trailing whitespace', () => {
            // parseFloat should trim whitespace
            const timestamp = '1707550800 '
            const result = textToDate(timestamp)
            expect(result).not.toBeNull()
            expect(result?.getTime()).toBe(1707550800000)
        })

        it('should handle negative timestamps (before epoch)', () => {
            const timestamp = '-86400' // 1 day before epoch
            const result = textToDate(timestamp)
            expect(result).not.toBeNull()
            expect(result?.getTime()).toBeLessThan(0)
        })

        it('should handle very small floating point timestamps', () => {
            const timestamp = '0.001'
            const result = textToDate(timestamp)
            // This is a very small but valid timestamp (Jan 1, 1970 00:00:00.001)
            expect(result).not.toBeNull()
            expect(result?.getTime()).toBe(1)
        })

        it('should return null for NaN after conversion', () => {
            const timestamp = 'NaN'
            const result = textToDate(timestamp)
            expect(result).toBeNull()
        })

        it('should return null for Infinity', () => {
            const timestamp = 'Infinity'
            const result = textToDate(timestamp)
            expect(result).toBeNull()
        })

        it('should handle string dates that parse to epoch 0', () => {
            // This tests that dateToTimestamp rejects epoch 0 even from valid date strings
            const epochString = '1970-01-01T00:00:00.000Z'
            const result = dateToTimestamp(epochString)
            expect(result).toBe('')
        })

        it('should handle null date in dateToTimestamp gracefully', () => {
            const result = dateToTimestamp(null)
            expect(result).toBe('')
            expect(typeof result).toBe('string')
        })

        it('should handle undefined date in dateToTimestamp gracefully', () => {
            const result = dateToTimestamp(undefined)
            expect(result).toBe('')
            expect(typeof result).toBe('string')
        })

        it('should return empty string for Invalid Date objects', () => {
            const invalidDate = new Date('not a real date')
            const result = dateToTimestamp(invalidDate)
            expect(result).toBe('')
        })

        it('should maintain precision with decimal timestamps', () => {
            const timestamp = '1707550800.123'
            const date = textToDate(timestamp)
            const result = dateToTimestamp(date)
            // Result maintains millisecond precision from conversion
            expect(result).toBe('1707550800.123')
        })
    })

    describe('mutation safety', () => {
        it('should not modify the input date', () => {
            const originalDate = new Date(1707550800000)
            const originalTime = originalDate.getTime()
            dateToTimestamp(originalDate)
            expect(originalDate.getTime()).toBe(originalTime)
        })

        it('should not share mutable state between calls', () => {
            const timestamp = '1707550800'
            const date1 = textToDate(timestamp)
            const date2 = textToDate(timestamp)
            expect(date1).toEqual(date2)
            expect(date1).not.toBe(date2) // Different instances
        })
    })
})
