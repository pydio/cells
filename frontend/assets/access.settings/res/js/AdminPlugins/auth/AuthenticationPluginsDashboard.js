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

import createReactClass from 'create-react-class'
import PluginsList from '../core/PluginsList'
import PluginEditor from '../core/PluginEditor'

const AuthenticationPluginsDashboard = createReactClass({

    mixins:[AdminComponents.MessagesConsumerMixin],
    render(){
        const pluginsList = <PluginsList
            pydio={this.props.pydio}
            title={this.context.getMessage('plugtype.title.authfront', '')}
            dataModel={this.props.dataModel}
            filterType={"authfront"}
            displaySmall={true}
            openRightPane={this.props.openRightPane}
            closeRightPane={this.props.closeRightPane}
            accessByName={this.props.accessByName}
        />;
        return (
            <PluginEditor
                {...this.props}
                pluginId={"core.auth"}
                style={{...this.props.style}}
                additionalPanes={{top:[], bottom:[pluginsList]}}
            />
        );
    }

});

export {AuthenticationPluginsDashboard as default}