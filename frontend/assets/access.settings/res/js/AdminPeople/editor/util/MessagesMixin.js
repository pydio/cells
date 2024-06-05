import React, { Component } from 'react';

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

function withRoleMessages(PydioComponent){

    return class WithRoleMessages extends Component {
        render(){
            let {pydio} = this.props;
            if(!pydio){
                pydio = Pydio.getInstance();
            }
            const messages = pydio.MessageHash;
            const getMessage = (messageId, namespace='pydio_role') => {
                return messages[namespace + (namespace?".":"") + messageId] || messageId;
            };
            const getPydioRoleMessage = (messageId) => {
                return messages['role_editor.' + messageId] || messageId;
            };
            const getAdminMessage = (messageId) => {
                return messages['ajxp_admin.' + messageId] || messageId;
            };
            const getRootMessage = (messageId) => {
                return messages[messageId] || messageId;
            };

            return <PydioComponent
                {...this.props}
                getMessage={getMessage}
                getPydioRoleMessage={getPydioRoleMessage}
                getRootMessage={getRootMessage}
                getAdminMessage={getAdminMessage}
            />
        }
    }
}

export {withRoleMessages}