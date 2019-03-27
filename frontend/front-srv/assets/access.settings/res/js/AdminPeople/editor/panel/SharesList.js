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

import React from 'react'
import Pydio from 'pydio'
import {Paper} from 'material-ui'
const {AsyncComponent} = Pydio.requireLib('boot');
import {RoleMessagesConsumerMixin} from '../util/MessagesMixin'

export default React.createClass({

    mixins:[RoleMessagesConsumerMixin],

    propTypes:{
        pydio: React.PropTypes.instanceOf(Pydio),
        userId:React.PropTypes.string.isRequired,
        userData:React.PropTypes.object.isRequired
    },

    render: function(){
        const {pydio, userId} = this.props;
        return (
            <div className="vertical-layout" style={{height:'100%'}}>
                <h3 className="paper-right-title">{this.context.getMessage('49')}
                    <div className="section-legend">{this.context.getMessage('52')}</div>
                </h3>
                <Paper style={{margin:16}} zDepth={1} className="workspace-activity-block layout-fill vertical-layout">
                    <AsyncComponent
                        pydio={pydio}
                        subject={"user:" + userId}
                        defaultShareType={'CELLS'}
                        namespace={"ShareDialog"}
                        componentName={"ShareView"}
                    />
                </Paper>
            </div>
        );
    }
});
