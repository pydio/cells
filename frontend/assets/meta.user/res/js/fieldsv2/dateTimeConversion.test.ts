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
    })
})
