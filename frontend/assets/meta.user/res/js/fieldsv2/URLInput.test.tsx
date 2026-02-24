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

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

import { URLIcon, URLLinkIcon } from './URLInput'

describe('URLIcon Component', () => {
    beforeEach(() => {
        cleanup()
    })

    it('renders the icon with default size', () => {
        render(<URLIcon />)
        const icon = screen.getByTestId('open-in-new-icon')
        expect(icon).toBeInTheDocument()
        expect(icon).toHaveClass('mdi', 'mdi-open-in-new')
    })

    it('renders the icon with custom font size', () => {
        render(<URLIcon fontSize={24} />)
        const icon = screen.getByTestId('open-in-new-icon')
        expect(icon.style.fontSize).toBe('24px')
    })

    it('inherits color from parent', () => {
        render(<URLIcon fontSize={18} />)
        const icon = screen.getByTestId('open-in-new-icon')
        expect(icon.style.color).toBe('inherit')
    })
})

describe('URLLinkIcon Component', () => {
    beforeEach(() => {
        cleanup()
    })

    it('returns null for empty URL', () => {
        const { container } = render(<URLLinkIcon url="" />)
        expect(container.firstChild).toBeNull()
    })

    it('returns null for whitespace-only URL', () => {
        const { container } = render(<URLLinkIcon url="   " />)
        expect(container.firstChild).toBeNull()
    })

    it('renders a link with icon for valid URL', () => {
        render(<URLLinkIcon url="example.com" />)
        const link = screen.getByTestId('url-link-icon')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('uses sanitized and normalized URL as href', () => {
        render(<URLLinkIcon url="example.com" />)
        const link = screen.getByTestId('url-link-icon')
        // sanitizeUrl may add a trailing slash
        expect(link.getAttribute('href')).toMatch(/^https:\/\/example\.com\/?$/)
    })

    it('uses custom display text in aria-label', () => {
        render(<URLLinkIcon url="example.com" displayText="My Website" />)
        const link = screen.getByTestId('url-link-icon')
        expect(link.getAttribute('aria-label')).toBe('Open My Website in a new tab')
    })

    it('uses URL as fallback for aria-label when no display text provided', () => {
        render(<URLLinkIcon url="example.com" />)
        const link = screen.getByTestId('url-link-icon')
        expect(link.getAttribute('aria-label')).toBe('Open example.com in a new tab')
    })

    it('renders children inside the link', () => {
        render(
            <URLLinkIcon url="example.com">
                <span>Click me</span>
            </URLLinkIcon>
        )
        expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('includes the icon after children', () => {
        const { container } = render(
            <URLLinkIcon url="example.com">
                <span>Click me</span>
            </URLLinkIcon>
        )
        const link = container.querySelector('[data-testid="url-link-icon"]')
        expect(link).toBeInTheDocument()
        const icon = link?.querySelector('[data-testid="open-in-new-icon"]')
        expect(icon).toBeInTheDocument()
    })

    it('stops click propagation when clicked', () => {
        const handleClick = vi.fn()
        const { container } = render(
            <div onClick={handleClick}>
                <URLLinkIcon url="example.com" />
            </div>
        )
        const link = screen.getByTestId('url-link-icon')
        fireEvent.click(link)
        expect(handleClick).not.toHaveBeenCalled()
    })

    it('handles custom font size for icon', () => {
        const { container } = render(<URLLinkIcon url="example.com" fontSize={24} />)
        const icon = container.querySelector('[data-testid="open-in-new-icon"]')
        expect(icon?.style.fontSize).toBe('24px')
    })

    it('sanitizes malicious URLs to about:blank', () => {
        render(
            <URLLinkIcon url="javascript:alert('xss')" />
        )
        const link = screen.getByTestId('url-link-icon')
        // sanitizeUrl converts malicious URLs to about:blank for safety
        expect(link.getAttribute('href')).toBe('about:blank')
    })

    it('handles https scheme URLs', () => {
        render(<URLLinkIcon url="https://example.com" />)
        const link = screen.getByTestId('url-link-icon')
        // sanitizeUrl may add a trailing slash
        expect(link.getAttribute('href')).toMatch(/^https:\/\/example\.com\/?$/)
    })

    it('handles ftp scheme URLs', () => {
        render(<URLLinkIcon url="ftp://files.example.com" />)
        const link = screen.getByTestId('url-link-icon')
        expect(link.getAttribute('href')).toBe('ftp://files.example.com')
    })

    it('handles mailto scheme URLs', () => {
        render(<URLLinkIcon url="mailto:test@example.com" />)
        const link = screen.getByTestId('url-link-icon')
        expect(link.getAttribute('href')).toBe('mailto:test@example.com')
    })
})
