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
const React = require('react');
const {ActionDialogMixin} = require('pydio').requireLib('boot');
import CompositeCard from './CompositeCard'
import PydioDataModel from 'pydio/model/data-model'
import Pydio from 'pydio'

let CompositeDialog = React.createClass({

    mixins: [ActionDialogMixin],

    getDefaultProps() {
        return {
            dialogTitle: '',
            dialogIsModal: false,
            dialogPadding: false,
            dialogSize:'lg'
        };
    },

    propTypes: {
        pydio: React.PropTypes.instanceOf(Pydio).isRequired,
        selection: React.PropTypes.instanceOf(PydioDataModel),
        readonly: React.PropTypes.bool,
    },

    childContextTypes: {
        messages: React.PropTypes.object,
        getMessage: React.PropTypes.func,
        isReadonly: React.PropTypes.func
    },

    getChildContext() {
        const messages = this.props.pydio.MessageHash;
        return {
            messages: messages,
            getMessage: (messageId, namespace = 'share_center') => {
                try {
                    return messages[namespace + (namespace ? "." : "") + messageId] || messageId;
                } catch (e) {
                    return messageId;
                }
            },
            isReadonly: () => {
                return this.props.readonly;
            }
        };
    },

    render(){
        const {pydio, selection} = this.props;
        let node;
        if(selection.getUniqueNode()){
            node = selection.getUniqueNode();
        }

        return (
            <CompositeCard
                editorOneColumn={this.props.editorOneColumn}
                pydio={pydio}
                mode="edit"
                node={node}
                onDismiss={this.props.onDismiss}
            />
        );
    }
});


export {CompositeDialog as default}