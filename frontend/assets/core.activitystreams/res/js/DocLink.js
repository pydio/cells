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

import React, {Fragment} from 'react'
import PropTypes from 'prop-types'
import Pydio from 'pydio'
const {PydioContextConsumer} = Pydio.requireLib('boot');

function nodesFromObject(object, pydio){
    let nodes = [];
    const currentRepository = pydio.user.getActiveRepository();
    if (!object || !object.partOf || !object.partOf.items || !object.partOf.items.length){
        return nodes;
    }
    for(let i = 0; i < object.partOf.items.length; i++ ){
        let ws = object.partOf.items[i];
        // Remove slug part
        let paths = ws.rel.split('/');
        paths.shift();
        let relPath = paths.join('/');
        if(relPath.indexOf('/') !== 0){
            relPath = '/' + relPath
        }
        const node = new AjxpNode(relPath, (object.type === 'Document'));
        node.getMetadata().set('repository_id', ws.id);
        node.getMetadata().set('repository_label', ws.name);
        node.getMetadata().set('filename', relPath);
        if(ws.id === currentRepository) {
            return [node];
        }
        nodes.push(node);
    }
    return nodes;
}

let DocLink = ({pydio, activity, children, linkStyle}) => {


    if (!activity.object.name) {
        activity.object.name = '';
    }
    const nodes = nodesFromObject(activity.object, pydio);
    if(nodes.length === 0) {
        return null;
    }

    let pathParts = activity.object.name.replace('doc://', '').split('/');
    pathParts.shift();
    const title = '/' + pathParts.join('/');

    if(nodes.length > 1) {

        const secondaryTexts = [' (', <span>{pydio.MessageHash['bookmark.secondary.inside'].toLowerCase()} </span>];
        nodes.sort( (a,b) => a.getMetadata().get('repository_label').localeCompare(b.getMetadata().get('repository_label')) )
        const nodeLinks = nodes.map((n,i) => {
            const link = (
                <a
                    style={{...linkStyle}}
                    onClick={(e) => { e.stopPropagation(); pydio.goTo(n);}}
                >{n.getMetadata().get('repository_label')}</a>
            );
            if(i === nodes.length - 1) {
                return link;
            } else {
                return <span>{link}, </span>
            }
        });
        secondaryTexts.push(...nodeLinks, ')')

        return (
            <Fragment><span title={title}>{children}</span> {secondaryTexts}</Fragment>
        );


    } else {

        return (
            <a title={title} style={{cursor: 'pointer', color: 'rgb(66, 140, 179)', ...linkStyle}} onClick={() => {pydio.goTo(nodes[0])}}>{children}</a>
        );


    }

}

DocLink.PropTypes = {
    activity: PropTypes.object,
    pydio: PropTypes.instanceOf(Pydio),
};

DocLink = PydioContextConsumer(DocLink);
export {DocLink as default, nodesFromObject};

