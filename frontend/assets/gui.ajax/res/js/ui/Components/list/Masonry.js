import Pydio from 'pydio'
import React, {useRef, useState, useEffect} from 'react'
import { useSize, useScroller } from "mini-virtual-list";
import { usePositioner, useResizeObserver, useMasonry } from "masonic";
const {useImagePreview} = Pydio.requireLib('hoc');
import {ContextMenuWrapper} from "./ListEntry";
import {sortNodesNatural} from "./sorters";
import SimpleList from "./SimpleList";
import EmptyStateView from "../views/EmptyStateView";
import {debounce} from 'lodash'
import {withNodeListenerEntry} from "./withNodeListenerEntry";
import {useDataModelContextNodeAsItems, useDataModelSelection} from "./hooks";

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

const triggerResize = debounce(() => {
    window.dispatchEvent(new Event('resize'));
}, 500)

const ResizingCard = withNodeListenerEntry(({width, data:{node, parent, dataModel, entryProps}, setInlineEditionAnchor}) => {

    // ratio may be modified by exif orientation
    let {ratio, src} = usePreview(node);
    const [hover, setHover] = useState(false);
    const selected = useDataModelSelection(dataModel, node);

    const {handleClicks, renderIcon, renderActions} = entryProps;
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
    const parentLabel = Pydio.getMessages()['react.1']

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
    if(hover) {
        cNames.push('hover')
    }
    if(selected) {
        cNames.push('selected')
    }
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
        <ContextMenuWrapper
            node={node}
            style={{width, height: width*ratio, position:'relative'}}
            className={cNames.join(' ')}
            onClick={(event) => handleClicks(node, parent?SimpleList.CLICK_TYPE_DOUBLE:SimpleList.CLICK_TYPE_SIMPLE, event)}
            onDoubleClick={(event) => handleClicks(node, SimpleList.CLICK_TYPE_DOUBLE, event)}
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
        >
            {src && <VisibleImage className={"masonry-image"} src={src} alt={node.getPath()} style={{width:width, ...rotateStyle}}/>}
            {parent && <div className={"mimefont-container"}><div className={"mimefont mdi mdi-chevron-left"}/></div>}
            {!parent && !src && renderIcon(node)}
            {!parent && <div style={{position:'absolute', top: 0, left: 0}}>{renderActions(node)}</div>}
            {src && <div className={'masonry-label-overlay'} style={{position:'absolute', bottom: 0, left: 0, right: 0, height: 50}}/>}
            <div className={'masonry-label'} ref={renameRef} style={{display:(hover||selected||!src)?'block':'none',...labelStyle}}>{parent?parentLabel:node.getLabel()}</div>
        </ContextMenuWrapper>
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

function childrenToItems(node, itemProps) {
    const items = []
    node.getChildren().forEach((item, key) => {
        items.push({id: 'item-' + key, node:item, ...itemProps})
    })
    items.sort((a,b) => sortNodesNatural(a.node, b.node))
    if(node.getParent()) {
        items.unshift({id: 'item-parent', parent: true, node: node.getParent(), ...itemProps})
    }
    return items;
}

export default React.memo(({className, dataModel, entryProps, emptyStateProps, errorStateProps, containerStyle={}, columnWidth=220, onScroll}) => {

    const itemProps = {dataModel, entryProps};
    const {node, items} = useDataModelContextNodeAsItems(dataModel, (node, resize) => {
        return childrenToItems(node, itemProps);
    });
    useEffect(()=>{
        window.dispatchEvent(new Event('resize'));
        triggerResize();
    }, [items])

    const keyDown = (event) => {
        if(event.key === 'Enter' && dataModel.getUniqueNode()){
            entryProps.handleClicks(dataModel.getUniqueNode(), SimpleList.CLICK_TYPE_DOUBLE, event)
        } else if(event.key === 'Delete'){
            Pydio.getInstance().Controller.fireActionByKey('key_delete')
        }
    }

    const containerRef = useRef(null);
    const { width, height } = useSize(containerRef);
    const { scrollTop, isScrolling } = useScroller(containerRef);

    useEffect(() => {
        triggerResize();
    }, [containerStyle.marginLeft])

    if(onScroll) {
        useEffect( () => {
            onScroll({scrollTop})
        }, [scrollTop])
    }

    const positioner = usePositioner({
        width,
        columnWidth,
        columnGutter: 8
    }, [items, columnWidth]);
    const resizeObserver = useResizeObserver(positioner);
    const masonryElement = useMasonry({
        positioner,
        resizeObserver,
        items,
        height,
        scrollTop,
        isScrolling,
        overscanBy: 6,
        render: ResizingCard
    });
    let emptyView;
    if (errorStateProps && node.getLoadError()) {
        emptyView = {...errorStateProps, secondaryTextId: node.getLoadError().message};
    } else if(emptyStateProps && !node.isLoading() && (!items || !items.length)){
        emptyView = emptyStateProps
    }
    return (
        <div style={{flex: 1, overflowY:'auto', ...containerStyle}} className={className} ref={containerRef} onKeyDown={keyDown}>
            {emptyView && <EmptyStateView pydio={Pydio.getInstance()} {...emptyView} />}
            {!emptyView && masonryElement}
        </div>
    );


})