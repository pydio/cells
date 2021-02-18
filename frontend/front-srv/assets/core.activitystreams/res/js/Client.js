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
import PydioApi from 'pydio/http/api'
import {ActivityServiceApi, ActivityStreamActivitiesRequest} from 'cells-sdk'

class AS2Client{

    static loadActivityStreams(context = 'USER_ID', contextData = '', boxName = 'outbox', pointOfView = '', offset = -1, limit = -1) {

        if (!contextData) {
            return Promise.resolve([]);
        }
        const api = new ActivityServiceApi(PydioApi.getRestClient());
        let req = new ActivityStreamActivitiesRequest();
        req.Context = context;
        req.ContextData = contextData;
        req.BoxName = boxName;
        if(offset > -1){
            req.Offset = offset;
        }
        if(limit > -1){
            req.Limit = limit;
        }
        req.Language = Pydio.getInstance().user.getPreference("lang") || '';
        if(pointOfView){
            req.PointOfView = pointOfView;
        }
        return api.stream(req);
    }

    static UnreadInbox(userId, callback = function(count){}) {

        const api = new ActivityServiceApi(PydioApi.getRestClient());
        let req = new ActivityStreamActivitiesRequest();
        req.Context = 'USER_ID';
        req.ContextData = userId;
        req.BoxName = 'inbox';
        req.UnreadCountOnly = true;
        return api.stream(req).then((data) => {
            return data.totalItems || 0;
        });

    }

}

export {AS2Client as default};
