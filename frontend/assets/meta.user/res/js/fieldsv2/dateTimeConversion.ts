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

/**
 * Converts a timestamp string to a Date object.
 * Expects timestamp in seconds (Unix timestamp / 1000).
 * Rejects epoch timestamp 0 (January 1, 1970) as a defensive measure.
 */
export const textToDate = (text: string): Date | null => {
    if (!text) return null;
    const timestamp = parseFloat(text);
    if (isNaN(timestamp)) return null;
    // Reject Unix epoch 0 (January 1, 1970) as it's likely a default/invalid value
    if (timestamp === 0) return null;
    const date = new Date(timestamp * 1000);
    return isNaN(date.getTime()) ? null : date;
};

/**
 * Converts a Date object or string to a timestamp string.
 * Returns timestamp in seconds (Unix timestamp / 1000).
 * Rejects epoch timestamp 0 (January 1, 1970) as a defensive measure.
 */
export const dateToTimestamp = (
    date: Date | string | null | undefined,
): string => {
    if (!date) return '';
    if (typeof date === 'string') {
        const dateObj = new Date(date);
        const time = dateObj.getTime();
        if (isNaN(time)) return '';
        // Reject Unix epoch 0 (January 1, 1970) as it's likely a default/invalid value
        if (time === 0) return '';
        return (time / 1000).toString();
    }
    if (!(date instanceof Date)) return '';
    const time = date.getTime();
    if (isNaN(time)) return '';
    // Reject Unix epoch 0 (January 1, 1970) as it's likely a default/invalid value
    if (time === 0) return '';
    return (time / 1000).toString();
};
