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

/** NOTE: To help with autocompletion and type validation
* @typedef {import('ajv').ErrorObject} ErrorObject
* @typedef {import('ajv').SchemaObject} SchemaObject
*/

import { localizeAjvError } from './ajvErrorLocalization';

const translateValidationKey = (key) => {
    const messageHash = globalThis?.pydio?.MessageHash;
    if (!messageHash) return undefined;

    return messageHash[key] || messageHash[key.replace(/^meta\.user\./, '')];
};

/**
* Parse value for validation
* 
* @param {SchemaObject} schema
* @param {string|number} value
* @return {string}
**/
export const parseValueForValidation = (schema, value) => {
    if (schema.format === 'date-time') {
        return new Date(value * 1000).toISOString()
    }

    return value
}

/** 
* Parse errors from ajv
*
* @param {ErrorObject[]} jsonSchemaErrors
* @return {Record<string, string>}
**/
export const parseErrors = (jsonSchemaErrors) =>
    jsonSchemaErrors.reduce((acc, error) => {
        let ns;
        switch (error.keyword) {
            case 'required':
                ns = error.params.missingProperty
                break;
            default:
                ns = error.instancePath.replace('/', '')
                break;
        }
        return { ...acc, [ns]: localizeAjvError(error, translateValidationKey) }
    }, {});
