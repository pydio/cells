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
import {Toggle} from "material-ui";
import asFormField from "../hoc/asFormField";
const {ModernStyles} = Pydio.requireLib('hoc');

/**
 * Boolean input
 */
class InputBoolean extends React.Component {

    render(){
        let boolVal = this.props.value;
        if(typeof boolVal  === 'string'){
            boolVal = (boolVal === "true");
        }
        return(
            <span>
                <Toggle
                    toggled={boolVal}
                    onToggle={(e,v)=>this.props.onChange(e,v)}
                    disabled={this.props.disabled}
                    label={this.props.isDisplayForm()?this.props.attributes.label:null}
                    labelPosition={this.props.isDisplayForm()?'left':'right'}
                    {...ModernStyles.toggleField}
                />
            </span>
        );
    }

}

export default asFormField(InputBoolean, true);
