import Pydio from 'pydio'
import React, {useRef, useState, useEffect} from 'react'
import { useSize, useScroller } from "mini-virtual-list";
import { usePositioner, useResizeObserver, useMasonry } from "masonic";
const {useImagePreview} = Pydio.requireLib('hoc');
import useImage from 'react-use-image'
import {ContextMenuWrapper} from "./ListEntry";
import {sortNodesNatural} from "./sorters";
import SimpleList from "./SimpleList";

function usePreview(node) {
    let ratio = 0.5;
    if(node.getMetadata().has('ImageDimensions')){
        const dim = node.getMetadata().get('ImageDimensions')
        ratio = dim.Height / dim.Width;
    }
    const {src} = useImagePreview(node);
    const {loaded, dimensions} = useImage(src)
    // Compute ratio
    if(loaded && src && dimensions) {
        ratio = dimensions.height/dimensions.width
    }
    return {ratio, src};
}

const ResizingCard  = ({width, data:{node, parent, dataModel, entryProps}}) => {

    const {ratio, src} = usePreview(node);
    const [selected, setSelected] = useState(dataModel.getSelectedNodes().indexOf(node) > -1)
    const [hover, setHover] = useState(false);
    useEffect(() => {
        const handler = () => {
            setSelected(dataModel.getSelectedNodes().indexOf(node) > -1);
        }
        dataModel.observe('selection_changed', handler);
        return () => {
            dataModel.stopObserving('selection_changed', handler);
        }
    }, [selected, node]);
    let bs = null;
    if(selected){
        bs = 'rgb(1, 141, 204) 0px 0px 0px 2px';
    }

    const {handleClicks, renderIcon, renderActions} = entryProps;
    const labelStyle = {
        position:'absolute',
        bottom: 0, left: 0, right: 0,
        height: 24,
        padding: '2px 6px',
        color: 'white',
        backgroundColor: 'rgba(0,0,0, 0.3)',
        fontWeight: 500,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        borderRadius:'0 0 2px 2px'
    }
    const parentLabel = Pydio.getMessages()['react.1']

    return (
        <ContextMenuWrapper
            node={node}
            style={{width, height: width*ratio, backgroundColor:'#eee', boxShadow: bs, position:'relative', borderRadius: 4}}
            onClick={(event) => handleClicks(node, SimpleList.CLICK_TYPE_SIMPLE, event)}
            onDoubleClick={(event) => handleClicks(node, SimpleList.CLICK_TYPE_DOUBLE, event)}
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
        >
            {src && <img alt={node.getPath()} src={src} style={{width:width, borderRadius: 4}}/>}
            {parent && <div className={"mimefont-container"}><div className={"mimefont mdi mdi-chevron-left"}/></div>}
            {!parent && !src && renderIcon(node)}
            {!parent && <div style={{position:'absolute', top: 0, left: 0}}>{renderActions(node)}</div>}
            <div style={{display:(hover||selected||!src)?'block':'none',...labelStyle}}>{parent?parentLabel:node.getLabel()}</div>
        </ContextMenuWrapper>
    );

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

export default React.memo(({className, dataModel, entryProps}) => {

    const itemProps = {dataModel, entryProps};
    const computeItems = () => {
        return childrenToItems(dataModel.getContextNode(), itemProps)
    }

    const [items, setItems] = useState(computeItems)
    const [node, setNode] = useState(dataModel.getContextNode());
    useEffect(() => {
        const handler = () => {
            const node = dataModel.getContextNode();
            if(node.isLoaded()){
                setNode(node);
            } else{
                node.observeOnce("loaded", () => setNode(node));
            }
        };
        dataModel.observe('context_changed', handler);
        return () => {
            dataModel.stopObserving('context_changed', handler);
        }
    });

    useEffect(() => {
        setItems(computeItems());
        const childrenObserver = () => {
            setItems(childrenToItems(node, itemProps))
        }
        node.observe("child_added", childrenObserver);
        node.observe("child_removed", childrenObserver);
        node.observe("child_replaced", childrenObserver);
        return () => {
            node.stopObserving("child_added", childrenObserver);
            node.stopObserving("child_removed", childrenObserver);
            node.stopObserving("child_replaced", childrenObserver);
        }
    }, [node])

    if(!node.isLoaded()){
        node.observeOnce("loaded", () => {
            setItems(childrenToItems(node, itemProps));
        });
        node.load();
    }

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

    const positioner = usePositioner({
        width,
        columnWidth: 220,
        columnGutter: 8
    }, [items]);
    const resizeObserver = useResizeObserver(positioner);

    return (
        <div style={{width: '100%', flex: 1, padding: 8, overflowY:'auto'}} className={className} ref={containerRef} onKeyDown={keyDown}>
            {useMasonry({
                positioner,
                resizeObserver,
                items,
                height,
                scrollTop,
                isScrolling,
                overscanBy: 6,
                render: ResizingCard
            })}
        </div>
    );


})