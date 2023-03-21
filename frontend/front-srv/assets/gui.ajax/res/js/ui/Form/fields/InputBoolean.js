/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Pydio from 'pydio'
import React from "react";
import {Toggle, Checkbox} from "material-ui";
import asFormField from "../hoc/asFormField";
import {muiThemeable} from 'material-ui/styles'
const {ThemedModernStyles} = Pydio.requireLib('hoc');

const legendStyle = {
    position: 'absolute',
    fontSize: 16,
    lineHeight: '22px',
    top: 25,
    transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
    zIndex: 1,
    transform: 'scale(0.75) translate(0px, -28px)',
    transformOrigin: 'left top',
    pointerEvents: 'none',
    userSelect: 'none',
    color: 'rgba(0, 0, 0, 0.3)',
    left: 8,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '127%'
}

/**
 * Boolean input
 */
class InputBoolean extends React.Component {

    render(){
        let boolVal = this.props.value;
        const {variant, variantShowLegend, disabled, onChange, attributes, isDisplayForm, muiTheme} = this.props;
        if(typeof boolVal  === 'string'){
            boolVal = (boolVal === "true");
        }
        const ModernStyles = ThemedModernStyles(muiTheme)
        if (variant === 'v2') {
            let toggleStyle = {...ModernStyles.toggleFieldV2}
            if(variantShowLegend){
                toggleStyle.style = {...toggleStyle.style, padding:'23px 6px 4px'};
            }
            return (
                <div style={{position:'relative', height: 58}}>
                    <div style={{...legendStyle, display:variantShowLegend?'block':'none'}}>{attributes.description}</div>
                    <Checkbox
                        checked={boolVal}
                        onCheck={(e,v) => onChange(e,v)}
                        disabled={disabled}
                        label={isDisplayForm()?attributes.label:null}
                        labelPosition={'right'}
                        {...toggleStyle}
                    />
                </div>
            )
        } else {
            return (
                <Toggle
                    toggled={boolVal}
                    onToggle={(e,v)=>onChange(e,v)}
                    disabled={disabled}
                    label={isDisplayForm()?attributes.label:null}
                    labelPosition={isDisplayForm()?'left':'right'}
                    {...ModernStyles.toggleField}
                />
            )
        }
    }

}

export default asFormField(muiThemeable()(InputBoolean), true);
