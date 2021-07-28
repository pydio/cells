import React, {useState} from 'react'
import PydioApi from 'pydio/http/api'
import PathUtils from 'pydio/util/path'

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
    const prevName = node.getMetadata().get('ImagePreview');
    const ext = PathUtils.getFileExtension(prevName)
    return PydioApi.getClient().buildPresignedGetUrl(node, null, 'image/' + ext, {Bucket: 'io', Key:'pydio-thumbstore/' + prevName});
}

function thumbUrl(node, size) {
    return PydioApi.getClient().buildPresignedGetUrl(node, null, 'image/jpeg', {Bucket: 'io', Key:'pydio-thumbstore/' + node.getMetadata().get('uuid') + '-'+size+'.jpg'});
}

function hqUrl(node) {
    return PydioApi.getClient().buildPresignedGetUrl(node, null, 'image/' + node.getAjxpMime());
}

export {useImagePreview}