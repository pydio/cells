/*
 * Copyright 2025 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import {useEffect, useState} from 'react'
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
import PathUtils from 'pydio/util/path'
import ResourcesManager from 'pydio/http/resources-manager'

function useImagePreview(node) {

    const [data, setData] = useState({loaded: false, src: '', path: node.getPath()})
    if(data.loaded && data.path === node.getPath()) {
        return {src: data.src}
    }
    if (node.getMetadata().has('ImagePreview')) {
        imagePreviewUrl(node).then(src => setData({loaded: true, src: src, path: node.getPath()}))
    } else if(node.getMetadata().has('thumbnails')) {
        const meta = node.getMetadata().get("thumbnails") || [];
        const thumbs = {};
        meta.map(m => {
            thumbs[m.size] = m;
            if(m.id){
                thumbs[m.id] = m;
            }
        });
        const thumbsKeys = Object.keys(thumbs);
        let def;
        if(thumbsKeys.length){
            def = thumbs[thumbsKeys[0]].size;
        }
        let prom;
        if(thumbs['sm']){
            // There is thumb with given ID
            prom = thumbUrl(node, thumbs['sm'].size);
        } else if(thumbs[256]){
            // Pick 256 by default
            prom = thumbUrl(node, 256)
        } else if (def) {
            // Pick first thumb found
            prom = thumbUrl(node, def);
        } else {
            // Return HQ
            prom = hqUrl(node);
        }
        prom.then(src => setData({loaded: true, src, path: node.getPath()}))
    }

    return {src: ''}

}

function imagePreviewUrl(node) {
    const prevMeta = node.getMetadata().get('ImagePreview');
    let prevName;
    if (prevMeta instanceof Object) {
        if(prevMeta.Error) {
            return Promise.resolve('')
        }
        prevName = prevMeta.Key
    } else {
        prevName = prevMeta
    }
    const ext = PathUtils.getFileExtension(prevName)
    return PydioApi.getClient().buildPresignedGetUrl(node, null, 'image/' + ext, {Bucket: 'io', Key:'pydio-thumbstore/' + prevName});
}

function thumbUrl(node, size) {
    return PydioApi.getClient().buildPresignedGetUrl(node, null, 'image/jpeg', {Bucket: 'io', Key:'pydio-thumbstore/' + node.getMetadata().get('uuid') + '-'+size+'.jpg'});
}

function hqUrl(node) {
    return PydioApi.getClient().buildPresignedGetUrl(node, null, 'image/' + node.getAjxpMime());
}

const useDiaporamaBadge = (node) => {
    const [diaporamaBadge, setDiaporamaBadge] = useState(undefined)

    useEffect(() => {
        if(!node) {
            setDiaporamaBadge(undefined)
        }
        const pydio = Pydio.getInstance();
        if(node.getMetadata().get('ImagePreview') && pydio.Registry.findEditorById('editor.diaporama') && !node.getMetadata().get('ImagePreview').Error){
            ResourcesManager.loadClass('PydioDiaporama').then( ns => {
                setDiaporamaBadge(() => ns.Badge) // important to make sure that React handles it as a Component
            })
        }

    }, [node]);

    return {Badge:diaporamaBadge}
}

export {useImagePreview, useDiaporamaBadge}