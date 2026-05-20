/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
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

import { sanitizeUrl } from '@braintree/sanitize-url';

/**
 * If no scheme is provided, default to https:// to avoid relative links.
 * Keeps existing schemes (mailto:, ftp:, etc.) untouched.
 * Distinguishes between URL schemes (http:, ftp:, etc.) and port numbers (domain:8080).
 *
 * @param {string} raw
 * @returns {string}
 */
export const ensureHttpScheme = (raw) => {
    const trimmed = String(raw || '').trim();
    if (!trimmed) {
        return '';
    }
    // Check for valid URL schemes: must start with letter, followed by alphanumeric/+/-.
    // A valid scheme is followed by :// or : and then non-digits
    // This distinguishes from port numbers (localhost:8080 has only digits after :)
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) {
        return trimmed;
    }
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:(?!\d)/.test(trimmed)) {
        return trimmed;
    }
    return `https://${trimmed}`;
};

/**
 * Formats a URL for display and validation
 * @param {string} url - Raw URL input
 * @returns {{normalizedURL: string, displayURL: string}} Normalized and display URLs
 */
export const formatURL = (url) => {
    if (!url || !String(url).trim()) {
        return { normalizedURL: '', displayURL: '' };
    }
    const normalizedURL = ensureHttpScheme(url);
    const sanitizedURL = sanitizeUrl(normalizedURL);

    if (!sanitizedURL) {
        return { normalizedURL: '', displayURL: '' };
    }

    // Extract display text (domain or full URL)
    let displayURL = sanitizedURL;
    try {
        const urlObj = new URL(sanitizedURL);
        displayURL = urlObj.hostname || sanitizedURL;
    } catch (e) {
        // If URL parsing fails, use sanitized value
        displayURL = sanitizedURL;
    }

    // Decode percent-encoded characters for clean display
    try {
        displayURL = decodeURIComponent(displayURL);
    } catch (e) {
        // If decoding fails, keep as-is
    }

    return {
        normalizedURL,
        displayURL,
    };
};
