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

import ParamsMixins from './ParamsMixins'
import {RoleMessagesConsumerMixin} from '../util/MessagesMixin'

export default React.createClass({

    mixins:[ParamsMixins, RoleMessagesConsumerMixin],

    render: function(){
        var render = function(pluginName, paramName, paramValue, paramAttributes, inherited, type){
            if(type == 'action'){
                if(paramAttributes['label'] && pydio.MessageHash[paramAttributes['label']]){
                    return pydio.MessageHash[paramAttributes['label']];
                }else{
                    return paramName;
                }
            }else{
                let displayValue = (paramValue === '__PYDIO_VALUE_SET__' ? '***********' : paramValue);
                return (paramAttributes['label'] + ' ' + displayValue);
            }
        };
        var parameters = this.browseParams(
            this.props.role.PARAMETERS,
            this.props.roleParent.PARAMETERS,
            this.props.id,
            render,
            this.props.pluginsFilter,
            'parameter',
            false,
            true
        );
        var actions = this.browseParams(
            this.props.role.ACTIONS,
            this.props.roleParent.ACTIONS,
            this.props.id,
            render,
            this.props.pluginsFilter,
            'action',
            false,
            true
        );
        var strings = [];
        parameters = parameters[0].concat(parameters[1]);
        actions = actions[0].concat(actions[1]);
        if(parameters.length) {
            strings.push(this.context.getPydioRoleMessage('6') + ': ' + parameters.join(','))
        }
        if(actions.length) {
            strings.push( this.context.getPydioRoleMessage('46') + ': ' + actions.join(','));
        }
        return(
            <span className={'summary-parameters summary' + (strings.length?'':'-empty')}>
                    {strings.length?strings.join(' - '):this.context.getMessage('1')}
                </span>
        );
    }
});
