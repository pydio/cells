import Pydio from 'pydio'
import React, {useRef, useState, useEffect} from 'react'
import { useSize, useScroller } from "mini-virtual-list";
import { usePositioner, useResizeObserver, useMasonry } from "masonic";
const {useImagePreview} = Pydio.requireLib('hoc');
import useImage from 'react-use-image'

function usePreview(node) {
    let ratio = 1;
    if(node.getMetadata().has('ImageDimensions')){
        const dim = node.getMetadata().get('ImageDimensions')
        ratio = dim.Height / dim.Width;
    }
    const {src} = useImagePreview(node);
    const {loaded, dimensions} = useImage(src)
    // Compute ratio
    if(loaded && dimensions) {
        ratio = dimensions.height/dimensions.width
    }
    return {ratio, src};
}

const ResizingCard  = ({width, data:{node, dataModel}}) => {

    const {ratio, src} = usePreview(node);
    const [selected, setSelected] = useState(dataModel.getSelectedNodes().indexOf(node) > -1)
    useEffect(() => {
        const handler = () => {
            setSelected(dataModel.getSelectedNodes().indexOf(node) > -1);
        }
        dataModel.observe('selection_changed', handler);
        return () => {
            dataModel.stopObserving('selection_changed', handler);
        }
    }, [selected]);
    let bs = null;
    if(selected){
        bs = 'rgb(1, 141, 204) 0px 0px 0px 2px';
    }
    return (
        <div
            style={{width, height: width*ratio, backgroundColor:'#eee', boxShadow: bs}}
            onClick={() => dataModel.setSelectedNodes([node])}
        >
            {src && <img alt={node.getPath()} src={src} style={{width:width}}/>}
            {!src && node.getPath()}
        </div>
    );

}

export default React.memo(({dataModel}) => {

    const computeItems = () => {
        const items = []
        dataModel.getContextNode().getChildren().forEach((item, key) => {
            items.push({id: 'item-' + key, node:item, dataModel})
        })
        return items;
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
        console.log('Registering Observer');
        dataModel.observe('context_changed', handler);
        return () => {
            console.log('Unregistering observer');
            dataModel.stopObserving('context_changed', handler);
        }
    });

    useEffect(() => {
        setItems(computeItems());
    }, [node])

    if(!node.isLoaded()){
        node.observeOnce("loaded", () => {
            const items = []
            node.getChildren().forEach((item, key) => {
                items.push({id: 'item-' + key, node:item, dataModel})
            })
            setItems(items);
        });
        node.load();
    }

    const containerRef = useRef(null);
    // In this example we are deriving the height and width properties
    // from a hook that measures the offsetWidth and offsetHeight of
    // the scrollable div.
    //
    // The code for this hook can be found here:
    // https://github.com/jaredLunde/mini-virtual-list/blob/5791a19581e25919858c43c37a2ff0eabaf09bfe/src/index.tsx#L376
    const { width, height } = useSize(containerRef);
    // Likewise, we are tracking scroll position and whether or not
    // the element is scrolling using the element, rather than the
    // window.
    //
    // The code for this hook can be found here:
    // https://github.com/jaredLunde/mini-virtual-list/blob/5791a19581e25919858c43c37a2ff0eabaf09bfe/src/index.tsx#L414
    const { scrollTop, isScrolling } = useScroller(containerRef);
    const positioner = usePositioner({
        width,
        columnWidth: 220,
        columnGutter: 8
    }, [items]);
    const resizeObserver = useResizeObserver(positioner);

    /*
    const items = []
    nodes.forEach((item, key) => {
        items.push({id: 'item-' + key, data:{node:item}})
    })
     */

    return (
        <div style={{width: '100%', flex: 1, padding: 8, overflowY:'auto'}} ref={containerRef}>
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