/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {Divider, Chip} from 'material-ui'
import ChipValues from './ChipValues'

class Actions extends React.Component{

    onChange(newValues){
        const {rule} = this.props;
        this.props.onChange({...rule, actions:newValues});
    }

    render(){
        const {rule, policy, containerStyle} = this.props;
        let presetValues = [];
        let allowAll = false;
        let allowFreeString = false;
        if(! policy.ResourceGroup || policy.ResourceGroup === 'rest') {
            presetValues = ["GET", "POST", "PATCH", "PUT", "OPTIONS"];
            allowAll = true;
        } else if(policy.ResourceGroup === 'acl') {
            presetValues = ["read", "write"];
            allowAll = true;
        } else if(policy.ResourceGroup === 'oidc') {
            presetValues = ["login"];
        }

        return (
            <ChipValues
                title="Actions"
                containerStyle={containerStyle}
                values={rule.actions}
                presetValues={presetValues}
                allowAll={allowAll}
                allowFreeString={allowFreeString}
                onChange={this.onChange.bind(this)}
            />
        );

    }

}

export {Actions as default}