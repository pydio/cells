/*
 * Copyright 2025 Abstrium SAS <team (at) pyd.io>
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
import React, {useRef, useState, useEffect} from 'react'

const {useImagePreview} = Pydio.requireLib('hoc');
import {ContextMenuWrapper, ModernListEntry} from "./ModernListEntry";
import {withNodeListenerEntry} from "../withNodeListenerEntry";

const rotations = {
    2:{scaleX:-1, scaleY:1},
    3:{rotate:'180deg'},
    4:{rotate:'180deg', scaleX:-1, scaleY:1},
    5:{rotate:'90deg', scaleX:1, scaleY:-1, tX:-1, tY:1},
    6:{rotate:'90deg', tX:-1, tY:-1},
    7:{rotate:'270deg', scaleX:1, scaleY:-1, tX:1, tY:-1},
    8:{rotate:'270deg', tX:1, tY: 1},
}
function rotate(rotation) {
    const pieces = [];
    if(rotation.rotate){
        pieces.push(`rotate(${rotation.rotate})`)
    }
    if(rotation.scaleX) {
        pieces.push(`scale(${rotation.scaleX}, ${rotation.scaleY})`)
    }
    if(rotation.translateX) {
        pieces.push(`translate(${rotation.translateX}px,${rotation.translateY}px)`)
    }
    return pieces.join(' ');
}

function usePreview(node) {
    const [ratio, setRatio] = useState(0.5)
    const {src} = useImagePreview(node);

    useEffect(() => {
        if(!src) {
            setRatio(0.5)
            return;
        }
        if(node.getMetadata().has('ImageDimensions')){
            const dim = node.getMetadata().get('ImageDimensions')
            setRatio(dim.Height / dim.Width)
        } else {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                const computedRatio = img.naturalHeight / img.naturalWidth;
                setRatio(computedRatio);
            };
        }
    }, [src]);
    return {ratio, src};
}

function useIsVisible(ref) {
    const [isIntersecting, setIntersecting] = useState(false);

    const fallback = (el) => {

        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.target && !entry.rootBounds && fallback(entry.target)) {
                setIntersecting(true)
                return
            }
            if(entry.isIntersecting){
                return setIntersecting(entry.isIntersecting)
            }
        }, {threshold:0.1, root: null});

        observer.observe(ref.current);
        return () => {
            observer.disconnect();
        };
    }, [ref]);

    return isIntersecting;
}

const ModernMasonryEntry = withNodeListenerEntry(({width, data, setInlineEditionAnchor}) => {

    const {node, isParent, handleItemClick, handleItemDoubleClick, entryRenderIcon, entryRenderActions, selection} = data;
    // ratio may be modified by exif orientation
    let {ratio, src} = usePreview(node);
    const selected = selection.get(node)

    const labelStyle = {
        position:'absolute',
        bottom: 0, left: 0, right: 0,
        height: 32,
        padding: '6px 10px',
        fontWeight: 500,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        borderRadius:'0 0 2px 2px'
    }
    let parentLabel = Pydio.getMessages()['react.1']
    parentLabel = parentLabel.charAt(0).toUpperCase() + parentLabel.slice(1);


    let rotateStyle={}
    if(src && ratio && node.getMetadata().get("image_exif_orientation")){
        const orientation = parseInt(node.getMetadata().get("image_exif_orientation"));
        if(rotations[orientation]) {
            const rot = {...rotations[orientation]};
            if (orientation < 5) {
                rotateStyle = {transform:rotate(rot)}
            } else {
                ratio = 1/ratio;
                const contW = width;
                const contH = width * ratio;
                const translate = (contW - contH) / 2
                rot.translateX = translate*rot.tX
                rot.translateY = translate*rot.tY
                rotateStyle = {transform:rotate(rot), width: contH}
            }
        }
    }
    const cNames = ['masonry-card']
    if(src) {
        cNames.push('has-src')
    }

    const renameRef = useRef(null)
    useEffect(()=>{
        if(setInlineEditionAnchor && renameRef.current) {
            setInlineEditionAnchor(renameRef.current)
        }
    }, [node])

    return (
        <ModernListEntry
            node={node}
            element={'div'}
            style={{width, height: width*ratio, position:'relative'}}
            className={cNames.join(' ')}
            onClick={(event) => handleItemClick(data, event)}
            onDoubleClick={(event) => handleItemDoubleClick(data, event)}
            selected={selected}
        >
            {src && <VisibleImage className={"masonry-image"} src={src} alt={node.getPath()} style={{width:width, ...rotateStyle}}/>}
            {isParent && <div className={"mimefont-container"}><div className={"mimefont mdi mdi-chevron-left"}/></div>}
            {!isParent && !src && entryRenderIcon(node)}
            {!isParent && entryRenderActions && <div style={{position:'absolute', top: 0, left: 0}}>{entryRenderActions(node)}</div>}
            {src && <div className={'masonry-label-overlay'} style={{position:'absolute', bottom: 0, left: 0, right: 0, height: 50}}/>}
            <div className={'masonry-label'} ref={renameRef} style={{display:(selected||!src)?'block':'none',...labelStyle}}>{isParent?parentLabel:node.getLabel()}</div>
        </ModernListEntry>
    );

}, (props) => props.data.node)

const VisibleImage = ({src, alt, style, className}) => {
    const ref = useRef();
    const isVisible = useIsVisible(ref);
    let s = {...style}
    s.transition = 'opacity 550ms cubic-bezier(0.23, 1, 0.32, 1) 0ms';
    if(!isVisible){
        s.opacity = 0;
    }
    return <img ref={ref} alt={alt} src={isVisible?src:null} style={s} className={className}/>
}

export {ModernMasonryEntry}
