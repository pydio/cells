/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

/**
 * Parses a tags value into an array of strings.
 * Handles three storage formats:
 *   - JSON-encoded array string: '["tag1","tag2"]'
 *   - Plain array: ["tag1", "tag2"]
 *   - Comma-separated string: "tag1,tag2"
 */
export const parseTagsValue = (value: string | string[]): string[] => {
    if (!value) return [];

    if (typeof value === 'string' && value.trim().startsWith('[')) {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed
                    .filter((tag) => typeof tag === 'string' && tag.trim())
                    .map((tag) => tag.trim());
            }
        } catch (e) {
            // Fall through to comma-split
        }
    }

    if (Array.isArray(value)) {
        return value
            .filter((tag) => typeof tag === 'string' && tag.trim())
            .map((tag) => tag.trim());
    }

    return (value || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => !!tag);
};

/**
 * Serializes a tags array back to a comma-separated string.
 * Also handles cases where the value arrives as a JSON string or a
 * single-element array wrapping a JSON string (AutoComplete quirk).
 */
export const formatTagsArrayToString = (value: string | string[]): string => {
    let arr: string[];

    if (typeof value === 'string') {
        try {
            arr = JSON.parse(value);
        } catch (e) {
            arr = [];
        }
    } else {
        arr = value;
    }

    if (
        Array.isArray(arr) &&
        arr.length === 1 &&
        typeof arr[0] === 'string'
    ) {
        try {
            arr = JSON.parse(arr[0]);
        } catch (e) {}
    }

    return (arr || []).filter((v: string) => v).join(',');
};
