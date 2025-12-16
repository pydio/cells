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
import React, { Fragment, useCallback, useMemo, useRef, useEffect, useState } from 'react'
import Pydio from 'pydio'
import asMetaField from "../hoc/asMetaField";
import asMetaForm from "../hoc/asMetaForm";
const { ModernTextField, ThemedModernStyles } = Pydio.requireLib('hoc');
import { muiThemeable } from 'material-ui/styles'
import { FontIcon } from 'material-ui'
import { debounce } from 'lodash'

/**
 * @param {{fontSize?: number}} props
 * @returns {React.ReactElement}
 */
const URLIcon = ({ fontSize }) =>
    <FontIcon
        data-testid="open-in-new-icon"
        className="mdi mdi-open-in-new"
        style={{ fontSize }} />

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
    const hasMinimalValidity = /^https?:\/\//i.test(url);
    if (!hasMinimalValidity) {
        return null;
    }

    const labelText = displayText || children || url;

    return (
        <a href={url}
            target="_blank"
            aria-label={`Open ${labelText} in a new tab`}
            rel="noopener noreferrer"
            onClick={(e) => {
                e.stopPropagation();
            }}
            style={{
                color: 'var(--md-sys-color-primary)',
                textDecoration: 'none'
            }}
        >
            <URLIcon fontSize={fontSize} />
            {children}
        </a>
    )

}

/**
 * @param {{getRealValue: () => string}} props
 * @returns {React.ReactElement}
 */
const URLFieldBase = ({ getRealValue }) => {
    const value = getRealValue();

    if (!value) {
        return <Fragment></Fragment>;
    }

    // Validate URL format
    let url = value;
    let displayText = value;

    // Extract display text (domain or full URL)
    try {
        const urlObj = new URL(url);
        displayText = urlObj.hostname || value;
    } catch (e) {
        // If URL parsing fails, use original value
        displayText = value;
    }

    return <URLLinkIcon fontSize={14} url={url} displayText={displayText} children={displayText} />;
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
    const debouncedUpdateRef = useRef(null);
    const [localValue, setLocalValue] = useState(value || '');

    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    const debouncedUpdate = useMemo(() => {
        if (debouncedUpdateRef.current) {
            debouncedUpdateRef.current.cancel();
        }
        debouncedUpdateRef.current = debounce((newValue) => {
            updateValue(newValue);
        }, 300);
        return debouncedUpdateRef.current;
    }, [updateValue]);

    const handleChange = useCallback((event, newValue) => {
        setLocalValue(newValue);
        debouncedUpdate(newValue);
    }, [debouncedUpdate]);

    const handleKeyPress = useCallback((event) => {
        if (event.key === 'Enter') {
            // Cancel any pending debounced update and save immediately
            if (debouncedUpdateRef.current) {
                debouncedUpdateRef.current.cancel();
            }
            updateValue(localValue, true);
        }
    }, [localValue, updateValue]);

    // Cleanup: cancel pending debounced calls on unmount
    useEffect(() => {
        return () => {
            if (debouncedUpdateRef.current) {
                debouncedUpdateRef.current.cancel();
            }
        };
    }, []);

    if (supportTemplates) {
        return (
            <ModernTextField
                value={localValue}
                fullWidth={true}
                hintText={label}
                onChange={(_, val) => {
                    setLocalValue(val);
                    debouncedUpdate(val);
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
                hintText={label || "Enter URL"}
                errorText={errorText}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                {...sProps}
                variant={search ? "v1" : "v2"}
            />
            {hasValue && !hasError && !search && (
                <div style={{
                    position: 'absolute',
                    right: 8,
                    top: 22,
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
