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
import Node from 'pydio/model/node'
import DataModel from 'pydio/model/data-model'
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types'

import MetaClient from "./MetaClient";
import UserMetaPanel from "./UserMetaPanel"

const {ActionDialogMixin,CancelButtonProviderMixin, SubmitButtonProviderMixin} = Pydio.requireLib('boot')

export default createReactClass({
    displayName: 'UserMetaDialog',

    propsTypes: {
        selection: PropTypes.instanceOf(DataModel),
    },

    mixins: [
        ActionDialogMixin,
        CancelButtonProviderMixin,
        SubmitButtonProviderMixin
    ],

    saveMeta(){
        let values = this.refs.panel.getUpdateData();
        let params = {};
        values.forEach(function(v, k){
            params[k] = v;
        });
        return MetaClient.getInstance().saveMeta(this.props.selection.getSelectedNodes(), values);
    },

    submit(){
        this.saveMeta().then(() => {
            this.dismiss();
        });
    },

    render(){
        return (
            <UserMetaPanel
                pydio={this.props.pydio}
                multiple={!this.props.selection.isUnique()}
                ref="panel"
                node={this.props.selection.isUnique() ? this.props.selection.getUniqueNode() : new Node()}
                editMode={true}
                style={{fontSize: 14}}
            />
        );
    },
});
