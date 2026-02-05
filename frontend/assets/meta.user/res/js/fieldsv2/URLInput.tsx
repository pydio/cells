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

import React, { useCallback, useState, useEffect } from 'react'
import { TextInput } from '@mantine/core'
import { sanitizeUrl } from "@braintree/sanitize-url"
import { InputProps } from "./CommonInputProps"

/**
 * If no scheme is provided, default to https:// to avoid relative links.
 * Keeps existing schemes (mailto:, ftp:, etc.) untouched.
 * Distinguishes between URL schemes (http:, ftp:, etc.) and port numbers (domain:8080).
 *
 * @param {string} raw
 * @returns {string}
 */
export const ensureHttpScheme = (raw: string): string => {
    const trimmed = String(raw || '').trim()
    if (!trimmed) {
        return ''
    }
    // Check for valid URL schemes: must start with letter, followed by alphanumeric/+/-.
    // A valid scheme is followed by :// or : and then non-digits
    // This distinguishes from port numbers (localhost:8080 has only digits after :)
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) {
        return trimmed
    }
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:(?!\d)/.test(trimmed)) {
        return trimmed
    }
    return `https://${trimmed}`
}

/**
 * Formats a URL for display and validation
 * @param {string} url - Raw URL input
 * @returns {{normalizedURL: string, displayURL: string}} Normalized and display URLs
 */
export const formatURL = (url: string): { normalizedURL: string; displayURL: string } => {
    if (!url || !String(url).trim()) {
        return { normalizedURL: '', displayURL: '' }
    }
    const normalizedURL = ensureHttpScheme(url)
    const sanitizedURL = sanitizeUrl(normalizedURL)

    if (!sanitizedURL) {
        return { normalizedURL: '', displayURL: '' }
    }

    // Extract display text (domain or full URL)
    let displayURL = sanitizedURL
    try {
        const urlObj = new URL(sanitizedURL)
        displayURL = urlObj.hostname || sanitizedURL
    } catch (e) {
        // If URL parsing fails, use sanitized value
        displayURL = sanitizedURL
    }

    return {
        normalizedURL,
        displayURL,
    }
}

/**
 * URLIcon component for displaying the open-in-new icon
 */
interface URLIconProps {
    fontSize?: number
}

export const URLIcon: React.FC<URLIconProps> = ({ fontSize = 14 }) => (
    <span
        data-testid="open-in-new-icon"
        className="mdi mdi-open-in-new"
        style={{ fontSize, color: 'inherit' }}
    />
)

/**
 * URLLinkIcon component - renders a link with icon or just the icon
 */
interface URLLinkIconProps {
    fontSize?: number
    url: string
    displayText?: string
    children?: React.ReactNode
}

export const URLLinkIcon: React.FC<URLLinkIconProps> = ({
    fontSize = 14,
    url,
    displayText,
    children,
}) => {
    if (!url || !String(url).trim()) {
        return null
    }
    const sanitizedURL = sanitizeUrl(ensureHttpScheme(url))
    if (!sanitizedURL) {
        return null
    }

    const labelText = displayText || children || url

    return (
        <a
            href={sanitizedURL}
            target="_blank"
            aria-label={`Open ${labelText} in a new tab`}
            rel="noopener noreferrer"
            onClick={(e) => {
                e.stopPropagation()
            }}
            style={{
                color: 'inherit',
                textDecoration: 'none',
            }}
            data-testid="url-link-icon"
        >
            {children}
            <URLIcon fontSize={fontSize} />
        </a>
    )
}

export const URLInput: React.FC<InputProps> = ({
    label,
    description,
    placeholder,
    disabled,
    required,
    value,
    onChange,
    requestToggleClose,
    errorText,
}) => {
    const [localValue, setLocalValue] = useState(value || '')

    useEffect(() => {
        setLocalValue(value || '')
    }, [value])

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const newValue = event.target.value
            setLocalValue(newValue)
            onChange(newValue, false)
        },
        [onChange]
    )

    const handleConfirmValue = useCallback(() => {
        const normalized = ensureHttpScheme(localValue)
        if (normalized !== localValue) {
            setLocalValue(normalized)
            onChange(normalized, false)
        }
    }, [localValue, onChange])

    const handleKeyPress = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Enter') {
                handleConfirmValue()
            }
        },
        [handleConfirmValue]
    )

    const props = {
        label,
        description,
        required,
        placeholder: placeholder || "URL",
        value: localValue,
        disabled,
        error: errorText,
    }

    const hasValue = localValue && localValue.trim() !== ''
    const hasError = !!errorText

    return (
        <div style={{ position: 'relative' }}>
            <TextInput
                {...props}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                onBlur={handleConfirmValue}
                autoFocus={!!requestToggleClose}
                rightSection={
                    hasValue && !hasError ? (
                        <URLLinkIcon fontSize={18} url={localValue} displayText={localValue} />
                    ) : null
                }
            />
        </div>
    )
}
