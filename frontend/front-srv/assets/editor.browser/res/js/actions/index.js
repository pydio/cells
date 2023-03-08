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
import React from "react";
import createReactClass from 'create-react-class'
const {ActionDialogMixin, CancelButtonProviderMixin, SubmitButtonProviderMixin} = Pydio.requireLib('boot');
const {ModernTextField} = Pydio.requireLib('hoc');
const PydioApi = require('pydio/http/api');
import LangUtils from 'pydio/util/lang';
import {TreeServiceApi, RestCreateNodesRequest, TreeNode, TreeNodeType} from 'cells-sdk';


class Callbacks{
    static createLink(){
        pydio.UI.openComponentInModal('PydioBrowserActions', 'CreateLinkDialog');
    }
}

const CreateLinkDialog = createReactClass({

    mixins:[
        ActionDialogMixin,
        CancelButtonProviderMixin,
        SubmitButtonProviderMixin
    ],

    getDefaultProps(){
        return {
            dialogSize: 'sm',
            dialogTitleId: 'openbrowser.4'
        }
    },

    submit(){
        const name = this.refs.name.getValue();
        const url = this.refs.url.getValue();
        if(!name || !url) {
            return;
        }
        const {pydio} = this.props;

        const api = new TreeServiceApi(PydioApi.getRestClient());
        const request = new RestCreateNodesRequest();
        const slug = pydio.user.getActiveRepositoryObject().getSlug();
        const path = slug + LangUtils.trimRight(pydio.getContextNode().getPath(), '/') + '/' + name + '.url';
        const node = new TreeNode();
        node.Path = path;
        node.Type = TreeNodeType.constructFromObject('LEAF');
        node.MetaStore = {"Contents": JSON.stringify(url)};
        request.Nodes = [node];
        api.createNodes(request).then(collection => {
            this.dismiss();
        });
    },

    render(){

        const mess = this.props.pydio.MessageHash;
        return (
            <div>
                <ModernTextField ref="url" floatingLabelText={mess['openbrowser.6']} fullWidth={true} hintText="https://..."  onKeyDown={(e) => {this.submitOnEnterKey(e)}} />
                <ModernTextField ref="name" floatingLabelText={mess['openbrowser.8']} fullWidth={true} onKeyDown={(e) => {this.submitOnEnterKey(e)}}/>
            </div>
        );
    }

});

export {
    Callbacks,
    CreateLinkDialog
};
