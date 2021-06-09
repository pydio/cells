import PydioApi from 'pydio/http/api'
import PathUtils from 'pydio/util/path'

function urlForSize(node, viewType) {
    if(!node){
        return Promise.resolve("")
    }
    if(!node.getMetadata().get("thumbnails") && node.getMetadata().get('ImagePreview')) {
        return imagePreviewUrl(node);
    }
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
    switch (viewType) {
        case "preview":
            if(thumbs['sm']){
                // There is thumb with given ID
                return thumbUrl(node, thumbs['sm'].size);
            } else if(thumbs[256]){
                // Pick 256 by default
                return thumbUrl(node, 256)
            } else if (def) {
                // Pick first thumb found
                return thumbUrl(node, def);
            } else {
                // Return HQ
                return hqUrl(node);
            }
        case "editor":
            if(thumbs['md']) {
                return thumbUrl(node, thumbs['md'].size);
            }else if(thumbs[512]){
                return thumbUrl(node, 512)
            } else if (def) {
                return thumbUrl(node,def);
            } else {
                return hqUrl(node);
            }
        case "hq":
            return hqUrl(node);
        default:
            return hqUrl(node);
    }

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

export {urlForSize as default}