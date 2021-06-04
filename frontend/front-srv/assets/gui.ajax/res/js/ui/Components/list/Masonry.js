import React, {useRef} from 'react'
import { useSize, useScroller } from "mini-virtual-list";
import { usePositioner, useResizeObserver, useMasonry } from "masonic";

const FakeCard = ({id, data}) => {
    return <div style={{width:'100%', height:data.height, backgroundColor:'#eee'}}>{id}</div>
}

export default () => {

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
        columnWidth: 172,
        columnGutter: 8
    });
    const resizeObserver = useResizeObserver(positioner);
    console.log(height, scrollTop);

    const items = [
        {id:'item1', data:{height:200}},
        {id:'item2', data:{height:200}},
        {id:'item3', data:{height:300}},
        {id:'item4', data:{height:400}},
        {id:'item5', data:{height:200}}
    ];

    return (
        <div className={{width: '100%', flex: 1}} ref={containerRef}>
            {useMasonry({
                positioner,
                resizeObserver,
                items,
                height,
                scrollTop,
                isScrolling,
                overscanBy: 6,
                render: FakeCard
            })}
        </div>
    );


}