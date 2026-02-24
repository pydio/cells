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

import React from 'react'
import {Toggle} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
const {ThemedModernStyles} = Pydio.requireLib("hoc")
import asMetaForm from "../hoc/asMetaForm";

class BooleanForm extends React.Component {

    render() {
        const {updateValue, value, search, errorText, muiTheme, mode} = this.props;
        const ModernStyles = ThemedModernStyles(muiTheme, {searchRadius:(mode==='popover'?8:null)})
        let sProps = {...ModernStyles.toggleFieldV1Search}
        const errStyle = {...ModernStyles.textFieldV2.errorStyle, fontSize: 12, lineHeight: '12px', color: 'var(--md-sys-color-error)'}
        let label = value ? 'Yes' : 'No'
        if(!search) {
            sProps = {...ModernStyles.toggleFieldV2}
            label = this.props.label + ' (' + label + ')'
        }
        const toggle = (
            <Toggle
                toggled={value}
                onToggle={(e,v) => {
                    updateValue(v);
                }}
                label={label}
                labelPosition={"right"}
                {...sProps}
            />
        );
        if(search) {
            return toggle
        } else if (errorText) {
            return (
                <div style={{margin:'12px 0 6px', position:'relative'}}>
                    {toggle}
                    <div style={errStyle}>{errorText}</div>
                </div>
            )
        } else {
            return <div style={{margin:'12px 0 6px'}}>{toggle}</div>
        }
    }

}

export default asMetaForm(muiThemeable()(BooleanForm));