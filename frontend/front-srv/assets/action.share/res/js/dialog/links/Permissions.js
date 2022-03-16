import React from 'react';

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
import ShareContextConsumer from '../ShareContextConsumer'
import {Checkbox} from 'material-ui'
import LinkModel from './LinkModel'
import ShareHelper from '../main/ShareHelper'
import {RestShareLinkAccessType} from 'cells-sdk'

export function PermissionsTitle(compositeModel, linkModel, getMessage) {
    let mainString = getMessage('71')
    let perms = [];
    if(linkModel.hasPermission('Preview')){
        perms.push(getMessage('72'))
    }
    if(linkModel.hasPermission('Download')){
        perms.push(getMessage('73'))
    }
    if(linkModel.hasPermission('Upload')){
        if (compositeModel.getNode().isLeaf()){
            perms.push(getMessage('74b'))
        } else {
            perms.push(getMessage('74'))
        }
    }
    if(perms.length){
        mainString = <span>{mainString} <i style={{opacity:.5}}>({perms.join(', ').toLowerCase()})</i></span>
    }
    return mainString
}

class PublicLinkPermissions extends React.Component {
    static propTypes = {
        linkModel: PropTypes.instanceOf(LinkModel),
        style: PropTypes.object
    };

    changePermission = (event) => {
        const name = event.target.name;
        const checked = event.target.checked;
        const {compositeModel, linkModel} = this.props;
        const link = linkModel.getLink();
        if(checked) {
            link.Permissions.push(RestShareLinkAccessType.constructFromObject(name));
        } else {
            link.Permissions = link.Permissions.filter((perm)=>{
                return (perm !== name);
            })
        }
        if(compositeModel.getNode().isLeaf()){
            const auth = ShareHelper.getAuthorizations();
            const max = auth.max_downloads;
            // Readapt template depending on permissions
            if (linkModel.hasPermission('Preview')) {
                link.ViewTemplateName = "pydio_unique_strip";
                link.MaxDownloads = 0; // Clear Max Downloads if Preview enabled
            } else {
                link.ViewTemplateName = "pydio_unique_dl";
                if(max && !link.MaxDownloads) {
                    link.MaxDownloads = max;
                }
            }
        }
        this.props.linkModel.updateLink(link);
    };

    render() {
        const {linkModel, compositeModel, pydio} = this.props;
        const node = compositeModel.getNode();
        let perms = [], previewWarning;
        const auth = ShareHelper.getAuthorizations();

        if(node.isLeaf()){
            const {preview,writeable} = ShareHelper.nodeHasEditor(pydio, node);
            perms.push({
                NAME:'Download',
                LABEL:this.props.getMessage('73'),
                DISABLED:!preview || !linkModel.hasPermission('Preview') // Download Only, cannot edit this
            });
            if(preview && !auth.max_downloads){
                perms.push({
                    NAME:'Preview',
                    LABEL:this.props.getMessage('72'),
                    DISABLED: !linkModel.hasPermission('Download')
                });
                if(linkModel.hasPermission('Preview')){
                    if(writeable){
                        perms.push({
                            NAME:'Upload',
                            LABEL:this.props.getMessage('74b')
                        });
                    }
                }
            }
        } else {
            perms.push({
                NAME:'Preview',
                LABEL:this.props.getMessage('72'),
                DISABLED:!linkModel.hasPermission('Upload')
            });
            perms.push({
                NAME:'Download',
                LABEL:this.props.getMessage('73')
            });
            perms.push({
                NAME:'Upload',
                LABEL:this.props.getMessage('74')
            });
        }

        /*
        if(this.props.shareModel.isPublicLinkPreviewDisabled() && this.props.shareModel.getPublicLinkPermission(linkId, 'read')){
            previewWarning = <div>{this.props.getMessage('195')}</div>;
        }
        */
        return (
            <div>
                {perms.map(function(p){
                    return (
                        <Checkbox
                            key={p.NAME}
                            disabled={p.DISABLED || this.props.isReadonly() || !linkModel.isEditable()}
                            type="checkbox"
                            name={p.NAME}
                            label={p.LABEL}
                            onCheck={this.changePermission}
                            checked={linkModel.hasPermission(p.NAME)}
                            labelStyle={{whiteSpace:'nowrap'}}
                            style={{margin:'10px 0'}}
                        />
                    );
                }.bind(this))}
                {previewWarning}
            </div>
        );
    }
}

PublicLinkPermissions = ShareContextConsumer(PublicLinkPermissions);
export {PublicLinkPermissions as default}