const React = require('react');
import SharedUsers from './SharedUsers'
import NodesPicker from './NodesPicker'
import GenericEditor from '../main/GenericEditor'

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

import PropTypes from 'prop-types';

import Pydio from 'pydio'
const {ResourcePoliciesPanel} = Pydio.requireLib('components');
import CellBaseFields from "./CellBaseFields";

/**
 * Dialog for letting users create a workspace
 */
export default class extends React.Component {
    static childContextTypes = {
        messages:PropTypes.object,
        getMessage:PropTypes.func,
        isReadonly:PropTypes.func
    };

    getChildContext() {
        const messages = this.props.pydio.MessageHash;
        return {
            messages: messages,
            getMessage: (messageId, namespace = 'share_center') => {
                try{
                    return messages[namespace + (namespace?".":"") + messageId] || messageId;
                }catch(e){
                    return messageId;
                }
            },
            isReadonly: (() => false)
        };
    }

    submit = () => {
        const {model, pydio} = this.props;
        const dirtyRoots = model.hasDirtyRootNodes();
        model.save().then(result => {
            this.forceUpdate();
            if(dirtyRoots && model.getUuid() === pydio.user.getActiveRepository()) {
                pydio.goTo('/');
                pydio.fireContextRefresh();
            }
        }).catch(reason => {
            pydio.UI.displayMessage('ERROR', reason.message);
        });
    };

    render() {

        const {pydio, model, sendInvitations} = this.props;
        const m = (id) => pydio.MessageHash['share_center.' + id];
        const tabs = {
            leftStyle:{padding:10},
            rightStyle:{padding:10},
            left: [
                {
                    Label:m(54),
                    Value:'users',
                    Component:(<SharedUsers
                        pydio={pydio}
                        cellAcls={model.getAcls()}
                        excludes={[pydio.user.id]}
                        sendInvitations={sendInvitations}
                        onUserObjectAdd={model.addUser.bind(model)}
                        onUserObjectRemove={model.removeUser.bind(model)}
                        onUserObjectUpdateRight={model.updateUserRight.bind(model)}
                    />)
                },
                {
                    Label:m('35'),
                    Value:'base',
                    Component: (<CellBaseFields
                        pydio={pydio}
                        model={model}
                    />)
                },
                {
                    Label:m(253),
                    Value:'permissions',
                    AlwaysLast: true,
                    Component:(
                        <ResourcePoliciesPanel
                            pydio={pydio}
                            resourceType="cell"
                            description={m('cell.visibility.advanced')}
                            resourceId={model.getUuid()}
                            style={{margin:-10}}
                            skipTitle={true}
                            onSavePolicies={()=>{}}
                            readonly={false}
                            cellAcls={model.getAcls()}
                        />
                    )
                }
            ],
            right: [
                {
                    Label:m(249),
                    Value:'content',
                    Component:(<NodesPicker pydio={pydio} model={model} mode="edit"/>)
                }
            ]
        };

        return (
            <GenericEditor
                pydio={pydio}
                tabs={tabs}
                header={<div style={{fontSize: 22, lineHeight:'26px', padding:6}}>{model.getLabel()}</div>}
                editorOneColumn={this.props.editorOneColumn}
                saveEnabled={model.isDirty()}
                onSaveAction={this.submit.bind(this)}
                onCloseAction={this.props.onDismiss}
                onRevertAction={()=>{model.revertChanges()}}
            />
        );

    }
}

