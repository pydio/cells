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
import React, {Fragment, useCallback} from 'react'
import Pydio from 'pydio'
import asMetaField from "../hoc/asMetaField";
import asMetaForm from "../hoc/asMetaForm";
const {ModernTextField, ThemedModernStyles} = Pydio.requireLib('hoc');
import {muiThemeable} from 'material-ui/styles'
import {FontIcon} from 'material-ui'

const URLIcon = ({ fontSize }) =>
    <FontIcon
        data-testid="open-in-new-icon"
        className="mdi mdi-open-in-new"
        style={{fontSize}} />

const URLFieldBase = ({getRealValue}) => {
    const value = getRealValue();

    if (!value) {
        return <Fragment></Fragment>;
    }

    // Validate URL format
    let url = value;
    let displayText = value;

    // If value doesn't start with http:// or https://, add https://
    if (url && !url.match(/^https?:\/\//i)) {
        url = 'https://' + url;
    }

    // Extract display text (domain or full URL)
    try {
        const urlObj = new URL(url);
        displayText = urlObj.hostname || value;
    } catch (e) {
        // If URL parsing fails, use original value
        displayText = value;
    }

    return (
        <Fragment>
            <a
                href={url}
                target="_blank"
                title={url}
                aria-label={`Open ${displayText} in a new tab`}
                rel="noopener noreferrer"
                style={{
                    color: 'var(--md-sys-color-primary)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                }}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <URLIcon fontSize={14} />
                {displayText}
            </a>
        </Fragment>
    );
}

const URLField = asMetaField(muiThemeable()(URLFieldBase));
export {URLField}

const URLFormBase = ({value, label, errorText, search, muiTheme, supportTemplates, updateValue}) => {
    const ModernStyles = ThemedModernStyles(muiTheme);

    const handleChange = useCallback((event, newValue) => {
        updateValue(newValue);
    }, [updateValue]);

    const handleKeyPress = useCallback((event) => {
        if (event.key === 'Enter') {
            updateValue(value, true);
        }
    }, [value, updateValue]);

    if (supportTemplates) {
        return (
            <ModernTextField
                value={value || ""}
                fullWidth={true}
                hintText={label}
                onChange={(event, val) => {
                    updateValue(val);
                }}
            />
        );
    }

    const sProps = search
        ? {...ModernStyles.textFieldV1Search}
        : {...ModernStyles.textFieldV2};

    const previewUrl = value && value.match(/^https?:\/\//i) ? value : 'https://' + value;
    const hasValue = value && value.trim() !== '';
    const hasError = !!errorText;

    return (
        <div style={{position: 'relative'}}>
            <ModernTextField
                value={value || ""}
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
                    <a
                        href={previewUrl}
                        target="_blank"
                        aria-label={`Open ${value} in a new tab`}
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        style={{
                            color: 'var(--md-sys-color-primary)',
                            textDecoration: 'none'
                        }}
                    >
                        <URLIcon fontSize={18} />
                    </a>
                </div>
            )}
        </div>
    );
}

const URLForm = asMetaForm(muiThemeable()(URLFormBase));
export {URLForm}
