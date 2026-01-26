/*
 * Copyright 2026 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

export interface InputProps {
    name: string;

    label?: string;
    subType?: string;
    description?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    errorText?: string;

    value?: any;
    onChange: (value: string|boolean|number, submit?: boolean) => void;

    requestToggleClose?: () => void;
}

export interface Items {
    key: string;
    value: string;
    color?: string;
}

export interface ItemsInputProps extends InputProps {
    items: Items[]
    itemsLoader?: (filter?: string) => Promise<Items[]>
}

export interface StringItemsInputProps extends InputProps {
    data: string[]
    dataLoader?: (filter?: string) => Promise<string[]>
}

/*
export interface MetaInputProps extends InputProps {

meta: NamespaceMeta;
fieldname: string;
value: any;
label: string;
readonly?: boolean;
required?: boolean;
errorText?: string;
onValueChange: (fieldname: string, value: string|boolean|number, immediate?: boolean) => void;

// If field is "togglable"
requestToggleClose:() => void;

// Display Context
supportTemplates?: boolean;
search?: boolean;
mode?: string;

additionalProps?: Record<string, any>;

}

 */
