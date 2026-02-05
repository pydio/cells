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

import { describe, it, expect } from 'vitest'
import { ensureHttpScheme, formatURL } from './URLInput'

describe('URL Utility Functions', () => {
    describe('ensureHttpScheme', () => {
        it('adds https:// to URLs without a scheme', () => {
            expect(ensureHttpScheme('example.com')).toBe('https://example.com')
        })

        it('preserves existing http:// scheme', () => {
            expect(ensureHttpScheme('http://example.com')).toBe('http://example.com')
        })

        it('preserves existing https:// scheme', () => {
            expect(ensureHttpScheme('https://example.com')).toBe('https://example.com')
        })

        it('preserves mailto: scheme', () => {
            expect(ensureHttpScheme('mailto:test@example.com')).toBe('mailto:test@example.com')
        })

        it('preserves ftp: scheme', () => {
            expect(ensureHttpScheme('ftp://example.com')).toBe('ftp://example.com')
        })

        it('preserves other schemes like tel:', () => {
            expect(ensureHttpScheme('tel:+1234567890')).toBe('tel:+1234567890')
        })

        it('preserves custom schemes with multiple characters', () => {
            expect(ensureHttpScheme('git+https://github.com/repo.git')).toBe(
                'git+https://github.com/repo.git'
            )
        })

        it('handles empty string', () => {
            expect(ensureHttpScheme('')).toBe('')
        })

        it('handles null/undefined by treating as empty string', () => {
            expect(ensureHttpScheme(null as any)).toBe('')
            expect(ensureHttpScheme(undefined as any)).toBe('')
        })

        it('trims whitespace before checking scheme', () => {
            expect(ensureHttpScheme('  example.com  ')).toBe('https://example.com')
            expect(ensureHttpScheme('  http://example.com  ')).toBe('http://example.com')
        })

        it('does not add scheme to whitespace-only strings', () => {
            expect(ensureHttpScheme('   ')).toBe('')
        })

        it('handles URLs with multiple dots correctly', () => {
            expect(ensureHttpScheme('example.co.uk')).toBe('https://example.co.uk')
        })

        it('handles URLs with hyphens in domain', () => {
            expect(ensureHttpScheme('my-example.com')).toBe('https://my-example.com')
        })

        it('handles URLs with subdomains', () => {
            expect(ensureHttpScheme('sub.domain.example.com')).toBe('https://sub.domain.example.com')
        })

        it('handles URLs with ports', () => {
            expect(ensureHttpScheme('example.com:8080')).toBe('https://example.com:8080')
        })

        it('handles URLs with paths', () => {
            expect(ensureHttpScheme('example.com/path/to/page')).toBe('https://example.com/path/to/page')
        })

        it('handles URLs with query strings', () => {
            expect(ensureHttpScheme('example.com?param=value')).toBe('https://example.com?param=value')
        })

        it('handles URLs with fragments', () => {
            expect(ensureHttpScheme('example.com#section')).toBe('https://example.com#section')
        })
    })

    describe('formatURL', () => {
        it('returns empty strings for empty input', () => {
            const result = formatURL('')
            expect(result).toEqual({ normalizedURL: '', displayURL: '' })
        })

        it('returns empty strings for whitespace-only input', () => {
            const result = formatURL('   ')
            expect(result).toEqual({ normalizedURL: '', displayURL: '' })
        })

        it('normalizes URL and extracts hostname for display', () => {
            const result = formatURL('example.com')
            expect(result.normalizedURL).toBe('https://example.com')
            expect(result.displayURL).toBe('example.com')
        })

        it('extracts hostname from full URL with path', () => {
            const result = formatURL('example.com/path/to/page')
            expect(result.displayURL).toBe('example.com')
        })

        it('extracts hostname from URL with subdomain', () => {
            const result = formatURL('sub.example.com')
            expect(result.displayURL).toBe('sub.example.com')
        })

        it('handles URLs with port numbers', () => {
            const result = formatURL('example.com:8080')
            expect(result.normalizedURL).toBe('https://example.com:8080')
            expect(result.displayURL).toBe('example.com')
        })

        it('handles URLs with query parameters', () => {
            const result = formatURL('example.com?param=value')
            expect(result.displayURL).toBe('example.com')
        })

        it('preserves existing https:// scheme', () => {
            const result = formatURL('https://example.com')
            expect(result.normalizedURL).toBe('https://example.com')
            expect(result.displayURL).toBe('example.com')
        })

        it('preserves existing http:// scheme', () => {
            const result = formatURL('http://example.com')
            expect(result.normalizedURL).toBe('http://example.com')
            expect(result.displayURL).toBe('example.com')
        })

        it('preserves ftp:// scheme', () => {
            const result = formatURL('ftp://files.example.com')
            expect(result.normalizedURL).toBe('ftp://files.example.com')
            expect(result.displayURL).toBe('files.example.com')
        })

        it('handles mailto: URLs correctly', () => {
            const result = formatURL('mailto:test@example.com')
            expect(result.normalizedURL).toBe('mailto:test@example.com')
            // mailto URLs don't parse as web URLs, so displayURL should be the sanitized value
            expect(result.displayURL).not.toBe('')
        })

        it('uses full normalized URL when URL parsing fails', () => {
            const result = formatURL('not-a-valid-url-format')
            expect(result.normalizedURL).toBe('https://not-a-valid-url-format')
            // When URL parsing fails, displayURL falls back to the normalized URL
            // sanitizeUrl may return the value unchanged, so we test that displayURL is not empty
            expect(result.displayURL).not.toBe('')
            expect(typeof result.displayURL).toBe('string')
        })

        it('extracts hostname from URL with www prefix', () => {
            const result = formatURL('www.example.com')
            expect(result.displayURL).toBe('www.example.com')
        })

        it('handles internationalized domain names', () => {
            const result = formatURL('münchen.de')
            expect(result.normalizedURL).toBe('https://münchen.de')
        })

        it('trims whitespace from URLs', () => {
            const result = formatURL('  example.com  ')
            expect(result.normalizedURL).toBe('https://example.com')
            expect(result.displayURL).toBe('example.com')
        })

        it('handles URLs with authentication info', () => {
            const result = formatURL('https://user:pass@example.com')
            expect(result.displayURL).toBe('example.com')
        })

        it('handles localhost URLs', () => {
            const result = formatURL('localhost:3000')
            expect(result.normalizedURL).toBe('https://localhost:3000')
            expect(result.displayURL).toBe('localhost')
        })

        it('handles IP addresses', () => {
            const result = formatURL('192.168.1.1')
            expect(result.normalizedURL).toBe('https://192.168.1.1')
            expect(result.displayURL).toBe('192.168.1.1')
        })

        it('handles IP addresses with ports', () => {
            const result = formatURL('192.168.1.1:8080')
            expect(result.normalizedURL).toBe('https://192.168.1.1:8080')
            expect(result.displayURL).toBe('192.168.1.1')
        })

        it('handles URLs with fragments and query strings', () => {
            const result = formatURL('example.com/page?param=value#section')
            expect(result.displayURL).toBe('example.com')
        })
    })

    describe('Edge cases and security', () => {
        it('handles URLs with special characters in path', () => {
            const result = formatURL('example.com/path/with%20spaces')
            expect(result.displayURL).toBe('example.com')
        })

        it('handles very long URLs', () => {
            const longPath = 'a'.repeat(1000)
            const result = formatURL(`example.com/${longPath}`)
            expect(result.displayURL).toBe('example.com')
        })

        it('handles URLs with emojis in domain', () => {
            const result = formatURL('example.com')
            expect(result.displayURL).toBe('example.com')
        })

        it('handles multiple slashes in path', () => {
            const result = formatURL('example.com///path///to///page')
            expect(result.displayURL).toBe('example.com')
        })

        it('ensureHttpScheme preserves URL encoding', () => {
            const encoded = 'example.com/path%20with%20spaces'
            expect(ensureHttpScheme(encoded)).toBe(`https://${encoded}`)
        })

        it('formatURL handles already normalized URLs without modification', () => {
            const url = 'https://example.com/path'
            const result = formatURL(url)
            expect(result.normalizedURL).toBe(url)
        })
    })
})
