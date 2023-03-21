import React from "react";
import createReactClass from 'create-react-class';
import ParametersPicker from './ParametersPicker'

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

import PropTypes from 'prop-types';

import Pydio from "pydio";
import {muiThemeable} from 'material-ui/styles'
const {ActionDialogMixin, CancelButtonProviderMixin} = Pydio.requireLib('boot');

class ThemedTitle extends React.Component{
    render(){
        const {getMessage, muiTheme} = this.props;
        const bgColor = muiTheme.palette.primary1Color;
        const br = muiTheme.borderRadius
        return (
            <div style={{backgroundColor: bgColor, borderRadius: `${br}px ${br}px 0 0`, color: 'white', padding:24}}>
                <h3 style={{color:'white', fontSize: 20, marginBottom: 16}}>{getMessage('14')}</h3>
                <div className="legend">{getMessage('15')}</div>
            </div>
        );
    }
}

ThemedTitle = muiThemeable()(ThemedTitle);

let ParameterCreate = createReactClass({
    displayName: 'ParameterCreate',

    mixins: [
        ActionDialogMixin, CancelButtonProviderMixin
    ],

    propTypes:{
        workspaceScope:PropTypes.string,
        showModal:PropTypes.func,
        hideModal:PropTypes.func,
        pluginsFilter:PropTypes.func,
        roleType:PropTypes.oneOf(['user', 'group', 'role']),
        createParameter:PropTypes.func
    },

    getDefaultProps(){
        return {
            dialogPadding: 0,
            dialogTitle: '',
            dialogSize: 'md',
        }
    },

    getInitialState(){
        return {
            step:1,
            workspaceScope:this.props.workspaceScope,
            pluginName:null,
            paramName:null,
            actions: {},
            parameters: {},
        };
    },

    setSelection(plugin, type, param, attributes){
        this.setState({pluginName:plugin, type:type, paramName:param, attributes:attributes}, this.createParameter);
    },

    createParameter(){
        this.props.createParameter(this.state.type, this.state.pluginName, this.state.paramName, this.state.attributes);
        this.props.onDismiss();
    },

    render(){

        const getMessage = (id, namespace = 'pydio_role') => pydio.MessageHash[namespace + (namespace ? '.' : '') + id] || id;
        const {pydio, actions, parameters} = this.props;

        return (
            <div className="picker-list">
                <ThemedTitle getMessage={getMessage}/>
                <ParametersPicker
                    pydio={pydio}
                    allActions={actions}
                    allParameters={parameters}
                    onSelection={this.setSelection}
                    getMessage={getMessage}
                />
            </div>
        );

    },
});

export {ParameterCreate as default}