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

export interface MetaInputProps {
    fieldname: string;
    value: any;
    label: string;
    readonly?: boolean;
    onValueChange: (fieldname: string, value: string|boolean|number, immediate?: boolean) => void;
    errorText?: string;
    supportTemplates?: boolean;
    additionalProps?: Record<string, any>;
    search?: boolean;
    mode?: string;
    meta: SelectMeta;
}

export interface SelectItem {
    key: string;
    value: string;
    color?: string;
}


export interface SelectMeta {
    type?: 'text' | 'textarea' | 'json';
    data: {
        items?: SelectItem[];
        steps?: boolean;
    };
}
