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

import React, {Fragment, useEffect, useRef} from "react";
import {ModernMasonryEntry} from "./ModernMasonryEntry";

import { useSize, useScroller } from "mini-virtual-list";
import { usePositioner, useResizeObserver, useMasonry } from "masonic";
import CustomDragLayer from "./CustomDragLayer";
import {useFocusOnClick} from "./useFocusOnClick";

const ModernLayoutMasonry = ({pydio, items, handleKeyDown, handleItemClick, handleItemDoubleClick, entryRenderIcon, entryRenderActions, entryRenderFirstLine, displayMode, selection, onScroll}) => {

    const containerRef = useRef(null);
    useFocusOnClick(containerRef)
    const { width, height } = useSize(containerRef);
    const { scrollTop, isScrolling } = useScroller(containerRef);

    useEffect( () => {
        if(onScroll){
            onScroll({scrollTop})
        }
    }, [scrollTop])

    useEffect(() => {
        window.dispatchEvent(new Event('resize'))
    }, [containerRef.current]);

    let columnWidth = 220
    if(displayMode.indexOf('masonry-') === 0) {
        columnWidth = parseInt(displayMode.split('-')[1])
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
        items: items.filter(it => !it.isGroupHeader).map(it => {
            return {...it,
                handleItemClick,
                handleItemDoubleClick,
                entryRenderIcon,
                entryRenderActions,
                entryRenderFirstLine,
                selection}
        }),
        height,
        scrollTop,
        isScrolling,
        overscanBy: 6,
        render: ModernMasonryEntry
    });

    return (
        <Fragment>
            <CustomDragLayer/>
            <div style={{flex: 1, overflowY:'auto'}} tabIndex={0} ref={containerRef} onKeyDown={handleKeyDown}>
                {masonryElement}
            </div>
        </Fragment>
    )

}

export {ModernLayoutMasonry}