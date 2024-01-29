/*
 * Copyright 2024 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import React, {Fragment, useState, useEffect} from "react";
import UserAvatar from "../users/avatar/UserAvatar";
import Tooltip from "@mui/material/Tooltip";
import SearchAPI from 'pydio/http/search-api'
import ResourcesManager from 'pydio/http/resources-manager'

export default ({href, children}) => {

    const pydio = Pydio.getInstance();
    const {user} = pydio;
    const [loading, setLoading] = useState(false)
    const [resolved, setResolved] = useState(null)
    const [wsLib, setWsLib] = useState(null)
    useEffect(()=>{
        ResourcesManager.loadClass('PydioWorkspaces').then(lib => setWsLib(lib))
    }, [])

    const loadNode = (nodeUUID) => {
        setLoading(true)
        const api = new SearchAPI(pydio);
        api.searchByUUID(nodeUUID)
            .then(result => {
                const results = result.Results || []
                if(results.length === 0) {
                    return false;
                }
                // Favor a unique result in the current workspace
                const cc = results.filter(n => n.getMetadata().get('repository_id') === pydio.user.activeRepository)
                if (cc.length === 1) {
                    return cc
                }
                if (results.length > 1) {
                    results.sort((na, nb) => na.getMetadata().get('repository_display').localeCompare(nb.getMetadata().get('repository_display')))
                }
                return results
            }).then(results => {
            setResolved(results)
        })
            .catch(()=>{
                setResolved(false)
            })
            .then(()=>setLoading(false));
    }

    // On preview, load node directly
    useEffect(() => {
        if(href.startsWith('doc://')) {
            icon = 'mdi mdi-file-outline'
            const hasPreview = href.indexOf('?preview') > -1;
            if(hasPreview) {
                const nodeUUID = href.replace('doc://', '').replace('?preview', '')
                loadNode(nodeUUID);
            }
        }
    }, [href])

    const linkStyle = {};

    if (href.startsWith('user://')) {
        const userId = href.replace('user://', '');
        return (
            <UserAvatar
                userId={userId}
                richOnClick={false}
                displayAvatar={false}
                style={{...linkStyle, display:'inline-block'}}
                pydio={pydio}
            />)
    }

    let title = "";
    let icon;
    let onClick = null, onEnter = null;
    if(href.startsWith('doc://')){
        icon = 'mdi mdi-file-outline'
        const hasPreview = href.indexOf('?preview') > -1;
        const nodeUUID = href.replace('doc://', '').replace('?preview', '')
        title = loading ? 'Loading document...' : 'Go to document'
        let singleNode;
        if(resolved === null) {
            onEnter=()=> loadNode(nodeUUID);
        } else if(resolved.length === 1) {
            singleNode = resolved[0];
            title = 'Click to open ' + resolved[0].getPath()
            onClick = () => {
                title = 'Opening document...'
                pydio.goTo(resolved[0]);
            }
        } else if(resolved.length > 1) {
            singleNode = resolved[0]
            const liStyle = {marginLeft: 10,textDecoration:'underline', cursor: 'pointer'};
            title = (
                <Fragment>
                    <div>Open document in...</div>
                    <ul>{resolved.map(n => <li style={liStyle} onClick={() => {pydio.goTo(n)}}>{n.getMetadata().get('repository_display')}</li>)}</ul>
                </Fragment>
            );
        } else if(resolved === false) {
            icon='mdi mdi-file-alert-outline';
            title = 'Document not found, may have been deleted?'
        }
        if(singleNode) {
            let icClass = singleNode.getSvgSource() || (singleNode.isLeaf() ? 'file': 'folder');
            if(icClass && !icClass.startsWith('icomoon')){
                icClass = 'mdi mdi-' + icClass;
            }
            icon = 'mimefont ' + icClass
        }
        if(singleNode && wsLib && hasPreview) {
            // Directly return preview
            const {FilePreview} = wsLib;
            return (
                <div className={'preview-container'} onClick={() => pydio.goTo(singleNode)} style={{cursor: 'pointer'}} title={children}>
                    <div className={"preview-title"}>
                        <span className={icon} style={{marginRight: 5}}/>{singleNode.getLabel()}
                    </div>
                    <FilePreview
                    node={singleNode}
                    style={{height: 200, minHeight: 200}}
                    mimeFontStyle={{fontSize:40}}
                    loadThumbnail={true}
                    richPreview={true}
                    />
                </div>
            );
        }
    } else if (href.startsWith('workspaces://')) {

        title = 'Switch to workspace'
        icon = 'mdi mdi-folder'
        const wsId = href.replace('workspaces://', '');
        if (user && user.getRepositoriesList().has(wsId)) {
            const repo = user.getRepositoriesList().get(wsId)
            if (repo.getRepositoryType() === 'cell') {
                icon = 'icomoon-cells'
            }
            onClick = () => {
                setLoading(true)
                pydio.triggerRepositoryChange(wsId)
                    .catch(() => {
                    })
                    .then(() => setLoading(false))
            }
        }
        if (loading) {
            title = 'Switching to workspace...'
        }
    } else {
        return <a href={href} target={"_blank"}>{children}</a>
    }

    title = <div style={{padding:'8px 16px', fontSize: 13}}>{title}</div>
    if(loading || resolved === false) {
        onEnter = null;
        onClick = null;
        linkStyle.cursor = 'default';
        if(loading) {
            icon = 'mdi mdi-file-search-outline'
        } else {
            icon = 'mdi mdi-file-alert-outline'
        }
    }
    const link = (
        <a style={linkStyle} onClick={onClick} onMouseEnter={onEnter} className={"special-link"}>
            {icon && <span className={icon} style={{marginRight: 5}}/>}
            {children}
        </a>
    )
    if(title) {
        return (
            <Tooltip title={title} arrow placement={"right-start"}>{link}</Tooltip>
        );
    } else {
        return link;
    }

}
