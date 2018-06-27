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
const { PydioContextConsumer } = Pydio.requireLib('boot');
const {ActivityList} = Pydio.requireLib('PydioActivityStreams');

class ActivityStreamsPanel extends React.Component{

    render(){

        const {pydio} = this.props;

        if (pydio.user && !pydio.user.lock && ActivityList) {
            return (
                <ActivityList
                    context="USER_ID"
                    contextData={pydio.user.id}
                    boxName="outbox"
                    style={{overflowY:'scroll', flex: 1}}
                    pointOfView="ACTOR"
                    groupByDate={true}
                    displayContext={"mainList"}
                    offset={0}
                    limit={50}
                />
            );
        } else {
            return <div></div>;
        }

    }

}

ActivityStreamsPanel = PydioContextConsumer(ActivityStreamsPanel);
export {ActivityStreamsPanel as default};