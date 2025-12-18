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
/**
 * @type {import('react')} React
 */
import React, { Fragment, useCallback, useEffect, useState } from 'react'
import Pydio from 'pydio'
import asMetaField from "../hoc/asMetaField";
import asMetaForm from "../hoc/asMetaForm";
const { ModernTextField, ThemedModernStyles } = Pydio.requireLib('hoc');
import { muiThemeable } from 'material-ui/styles'
import { FontIcon } from 'material-ui'
import { sanitizeUrl } from "@braintree/sanitize-url";

/**
 * If no scheme is provided, default to http:// to avoid relative links.
 * Keeps existing schemes (mailto:, ftp:, etc.) untouched.
 *
 * @param {string} raw
 * @returns {string}
 */
const ensureHttpScheme = (raw) => {
    const trimmed = String(raw || '').trim();
    if (!trimmed) {
        return '';
    }
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
        return trimmed;
    }
    return `https://${trimmed}`;
};

/**
 * @param {{fontSize?: number}} props
 * @returns {React.ReactElement}
 */
const URLIcon = ({ fontSize }) =>
    <FontIcon
        data-testid="open-in-new-icon"
        className="mdi mdi-open-in-new"
        style={{ fontSize, color: 'inherit' }} />

/**
 * @param {{
 *   fontSize?: number,
 *   url: string,
 *   displayText?: string,
 *   children?: React.ReactNode
 * }} props
 *
 *  @returns {React.ReactElement}
 */
const URLLinkIcon = ({ fontSize, url, displayText, children }) => {
    if (!url || !String(url).trim()) {
        return null;
    }
    const sanitizedURL = sanitizeUrl(ensureHttpScheme(url));
    if (!sanitizedURL) {
        return null;
    }

    const labelText = displayText || children || url;

    return (
        <a href={sanitizedURL}
            target="_blank"
            aria-label={`Open ${labelText} in a new tab`}
            rel="noopener noreferrer"
            onClick={(e) => {
                e.stopPropagation();
            }}
            style={{
                color: 'inherit',
                textDecoration: 'none'
            }}
        >
            {children}
            <URLIcon fontSize={fontSize} />
        </a>
    )

}

/**
 * @param {{getRealValue: () => string}} props
 * @returns {React.ReactElement}
 */
const URLFieldBase = ({ getRealValue }) => {
    const url = getRealValue();
    if (!url || !String(url).trim()) {
        return <Fragment></Fragment>;
    }
    const normalizedURL = ensureHttpScheme(url);
    const sanitizedURL = sanitizeUrl(normalizedURL);

    if (!sanitizedURL) {
        return <Fragment></Fragment>;
    }

    // Validate URL format
    let displayText = sanitizedURL;

    // Extract display text (domain or full URL)
    try {
        const urlObj = new URL(sanitizedURL);
        displayText = urlObj.hostname || sanitizedURL;
    } catch (e) {
        // If URL parsing fails, use original value
        displayText = sanitizedURL;
    }

    return <URLLinkIcon fontSize={14} url={normalizedURL} displayText={displayText} children={displayText} />;
}

/**
 * URL field
 * @type {typeof URLFieldBase}
 */
const URLField = asMetaField(muiThemeable()(URLFieldBase));
export { URLField }

/**
 * @param {{
 *   value: string,
 *   label: string,
 *   errorText: string,
 *   search: boolean,
 *   muiTheme: object,
 *   supportTemplates: boolean,
 *   updateValue: (value: string) => void
 * }} props
 * @returns {React.ReactElement}
 */
const URLFormBase = ({ value, label, errorText, search, muiTheme, supportTemplates, updateValue }) => {
    const ModernStyles = ThemedModernStyles(muiTheme);
    const [localValue, setLocalValue] = useState(value || '');

    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    const handleChange = useCallback((event, newValue) => {
        setLocalValue(newValue);
        updateValue(newValue, false);
    }, [updateValue]);

    const handleConfirm = useCallback((event, newValue) => {
        if (search) {
            setLocalValue(localValue);
            updateValue(localValue, false);
            return;
        }

        const normalized = ensureHttpScheme(localValue);
        if (normalized !== localValue) {
            setLocalValue(normalized);
            updateValue(normalized, false);
        }
    }, [updateValue, search]);

    const handleConfirmValue = useCallback(() => {
        if (search) {
            setLocalValue(localValue);
            updateValue(localValue, false);
            return;
        }

        const normalized = ensureHttpScheme(localValue);
        if (normalized !== localValue) {
            setLocalValue(normalized);
            updateValue(normalized, false);
        }
    }, [updateValue, localValue, search]);

    const handleKeyPress = useCallback((event) => {
        if (event.key === 'Enter') handleConfirmValue()
    }, [localValue, updateValue]);

    if (supportTemplates) {
        return (
            <ModernTextField
                value={localValue}
                fullWidth={true}
                hintText={label}
                onBlur={handleConfirmValue}
                onChange={(_, val) => {
                    setLocalValue(val);
                    updateValue(val, false);
                }}
            />
        );
    }

    const sProps = search
        ? { ...ModernStyles.textFieldV1Search }
        : { ...ModernStyles.textFieldV2 };

    const hasValue = localValue && localValue.trim() !== '';
    const hasError = !!errorText;

    return (
        <div style={{ position: 'relative' }}>
            <ModernTextField
                value={localValue}
                fullWidth={true}
                hintText={label || "URL"}
                errorText={errorText}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                onBlur={handleConfirmValue}
                {...sProps}
                variant={search ? "v1" : "v2"}
            />
            {hasValue && !hasError && !search && (
                <div style={{
                    position: 'absolute',
                    right: 8,
                    bottom: 10,
                    cursor: 'pointer'
                }}>
                    <URLLinkIcon fontSize={18} url={localValue} displayText={localValue} />
                </div>
            )}
        </div>
    );
}

/**
 * URL form
 * @type {typeof URLFormBase}
 */
const URLForm = asMetaForm(muiThemeable()(URLFormBase));
export { URLForm }
