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
import Pydio from 'pydio'
import {LinearProgress} from 'material-ui'
import {GenericLine} from './GenericCard'
import PathUtils from 'pydio/util/path'

export default class QuotaUsageLine extends React.Component {

    render() {
        const {node} = this.props;
        let usage = parseInt(node.getMetadata().get("ws_quota_usage"))
        const quota = parseInt(node.getMetadata().get("ws_quota"))
        usage = Math.min(usage, quota)
        const percent = Math.round(usage / quota * 100)
        let color = '#4caf50';
        if (percent > 90) {
            color = '#e53935'
        } else if (percent > 60) {
            color = '#ff9800'
        }
        const label = Pydio.getMessages()['workspace.quota-usage'] + " ("+ PathUtils.roundFileSize(quota) +")"
        const data = (
            <div style={{borderRadius: 4, display: 'flex', marginRight: 25, alignItems: 'center', marginTop: 5, backgroundColor: '#f5f5f5', padding: '7px 8px'}}>
                <div style={{flex: 1, paddingRight:12}}>
                    <LinearProgress mode={"determinate"} min={0} max={quota} value={usage} color={color} />
                </div>
                <div style={{color: '#bdbdbd', fontWeight: 500, fontSize: 18}}>{percent}%</div>
            </div>
        )
        return <GenericLine iconClassName={"mdi mdi-gauge"} legend={label} data={data} iconStyle={{marginTop: 30}}/>
    }

}

