/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import {MenuItem} from 'material-ui'
const {ModernSelectField} = Pydio.requireLib('hoc');

import PydioApi from 'pydio/http/api'
import {ActivityServiceApi, ActivitySubscription, ActivityOwnerType} from 'cells-sdk'


class WatchSelector extends React.Component{

    constructor(props){
        super(props);
        const {nodes} = this.props;
        this.state = this.valueFromNodes(nodes);
    }

    valueFromNodes(nodes = []) {

        let mixed =false, value = undefined;
        nodes.forEach(n => {
            const nVal = n.getMetadata().get('meta_watched') || '';
            if(value !== undefined && nVal !== value) {
                mixed = true;
            }
            value = nVal;
        });
        return {value, mixed};

    }


    onSelectorChange(value){

        if(value === 'mixed'){
            return;
        }

        const {pydio, nodes} = this.props;
        this.setState({saving: true});

        const proms = nodes.map(node => {
            const nodeUuid = node.getMetadata().get('uuid');
            const userId = pydio.user.id;
            let subscription = new ActivitySubscription();
            const type = new ActivityOwnerType();
            subscription.UserId = userId;
            subscription.ObjectId = nodeUuid;
            subscription.ObjectType = type.NODE;
            let events = [];
            if (value === 'META_WATCH_CHANGE' || value === 'META_WATCH_BOTH') {
                events.push('change');
            }
            if(value === 'META_WATCH_READ' || value === 'META_WATCH_BOTH'){
                events.push('read');
            }
            subscription.Events = events;
            const api = new ActivityServiceApi(PydioApi.getRestClient());
            return api.subscribe(subscription).then((outSub) => {
                let overlay = node.getMetadata().get('overlay_class') || '';
                if(value === '') {
                    node.getMetadata().delete('meta_watched');
                    node.getMetadata().set('overlay_class', overlay.replace('mdi mdi-bell', ''));
                } else {
                    node.getMetadata().set('meta_watched', value);
                    let overlays = overlay.replace('mdi mdi-bell', '').split(',');
                    overlays.push('mdi mdi-bell');
                    node.getMetadata().set('overlay_class', overlays.join(','));
                }
                node.notify('node_replaced');
            });
        });
        Promise.all(proms).then(() => {
            this.setState({value: value, mixed: false});
            window.setTimeout(()=>{
                this.setState({saving: false});
            }, 250);
        }).catch(() => {
            this.setState({saving: false});
        });
    }

    render(){

        const {fullWidth} = this.props;
        const {value, mixed, saving} = this.state;
        const mm = Pydio.getInstance().MessageHash;

        if(saving){
            return (
                <ModernSelectField value={"saving"} onChange={(e,i,v) => {}} disabled={true} fullWidth={fullWidth}>
                    <MenuItem value={"saving"} primaryText={mm['meta.watch.selector.saving'] + "..."}/>
                </ModernSelectField>
            );
        }

        return (
            <ModernSelectField value={mixed ?'mixed': value} onChange={(e,i,v) => {this.onSelectorChange(v)}} fullWidth={fullWidth}>
                {mixed && <MenuItem value={"mixed"} primaryText={mm['meta.watch.selector.mixed'] + "..."}/>}
                <MenuItem value={""} primaryText={mm['meta.watch.selector.ignore']}/>
                <MenuItem value={"META_WATCH_READ"} primaryText={mm['meta.watch.selector.read']}/>
                <MenuItem value={"META_WATCH_CHANGE"} primaryText={mm['meta.watch.selector.change']}/>
                <MenuItem value={"META_WATCH_BOTH"} primaryText={mm['meta.watch.selector.both']}/>
            </ModernSelectField>
        );

    }

}

export default WatchSelector