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
import PydioApi from 'pydio/http/api'
import {ActivityServiceApi, ActivitySubscription, ActivityOwnerType} from 'cells-sdk'

class Callbacks{

    static toggleWatch(manager, args){

        if(args){

            const node = pydio.getUserSelection().getUniqueNode();
            const nodeUuid = node.getMetadata().get('uuid');
            const userId = pydio.user.id;
            let subscription = new ActivitySubscription();
            const type = new ActivityOwnerType();
            subscription.UserId = userId;
            subscription.ObjectId = nodeUuid;
            subscription.ObjectType = type.NODE;
            let events = [];
            if (args === 'watch_change' || args === 'watch_both') {
                events.push('change');
            }
            if(args === 'watch_read' || args === 'watch_both'){
                events.push('read');
            }
            subscription.Events = events;
            const api = new ActivityServiceApi(PydioApi.getRestClient());
            api.subscribe(subscription).then((outSub) => {
                let overlay = node.getMetadata().get('overlay_class') || '';
                if(args === 'watch_stop') {
                    node.getMetadata().delete('meta_watched');
                    node.getMetadata().set('overlay_class', overlay.replace('mdi mdi-bell', ''));
                } else {
                    node.getMetadata().set('meta_watched', 'META_' + args.toUpperCase());
                    let overlays = overlay.replace('mdi mdi-bell', '').split(',');
                    overlays.push('mdi mdi-bell');
                    node.getMetadata().set('overlay_class', overlays.join(','));
                }
                node.notify('node_replaced');
            });

        }

    }



}

export {Callbacks as default}