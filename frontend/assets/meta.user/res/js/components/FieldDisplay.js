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

import React from 'react';
import StarsField from "../fields/StarsField";
import CssLabelsField from "../fields/CssLabelsField";
import SelectorField from "../fields/SelectorField";
import TagsCloud from "../fields/TagsCloud";
import {DateTimeField} from "../fields/DateTime";
import {URLField} from "../fields/URL";
import { getNumberPrefix, getNumberSuffix } from "../formatters/numbers";

const NumberDisplay = ({ value, format }) => {
    if (!value) return null;

    return <span>{`${getNumberPrefix(format)}${value || ''}${getNumberSuffix(format)}`}</span>;
}

/**
 * Renders a single metadata field in display mode
 */
export const FieldDisplay = ({fieldKey, meta, value, node, className, onValueClick}) => {
    const {label, type, data} = meta;
    const column = {name: fieldKey};
    let displayValue = value;

    switch (type) {
        case 'stars_rate':
            displayValue = <StarsField node={node} column={column} containerStyle={{fontSize: 18}} />;
            break;
        case 'choice':
            displayValue = <SelectorField node={node} column={column}/>;
            break;
        case 'css_label':
            displayValue = <CssLabelsField node={node} column={column}/>;
            break;
        case 'tags':
            displayValue = <TagsCloud node={node} column={column} containerStyle={{margin:'-7px 0'}}/>;
            break;
        case 'date':
            displayValue = <DateTimeField node={node} column={column} type={type}/>;
            break;
        case 'integer':
            displayValue = <NumberDisplay value={value} format={(data || {}).format} />;
            break;
        case 'boolean':
            displayValue = value ? 'Yes' : 'No';
            break;
        case 'url':
            displayValue = <URLField node={node} column={column}/>;
            break;
        default:
            break;
    }

    return (
        <div className={"infoPanelRow" + (value ? '' : ' no-value')+ (className?' '+className:'')}>
            <div className="infoPanelLabel">{label}</div>
            <div className="infoPanelValue" onClick={onValueClick}>{displayValue}</div>
        </div>
    );
};
