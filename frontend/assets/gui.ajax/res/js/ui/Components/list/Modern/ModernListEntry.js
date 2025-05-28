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

import React, {useState, useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import { FontIcon } from 'material-ui';
import {muiThemeable} from "material-ui/styles";
import ReactDOM from "react-dom";
import {DragSource, DropTarget, flow} from "react-dnd";
import Pydio from 'pydio'
import { Types, collect, collectDrop, nodeDragSource, nodeDropTarget } from '../../util/DND';
import {withNodeListenerEntry} from "../withNodeListenerEntry";
const {withContextMenu} = Pydio.requireLib('hoc');

const ContextMenuWrapper = withContextMenu((props) => {
    const {muiTheme, element, node, iconCell, firstLine, secondLine, ...others} = props;
    return React.createElement(element, {...others})
});


const ModernListEntry = withNodeListenerEntry(muiThemeable()((props) => {
    const {
        node,
        selected,
        onClick,
        onDoubleClick,
        entryRenderIcon,
        entryRenderActions,
        entryRenderFirstLine,
        entryRenderSecondLine,
        style,
        className,
        noHover,
        setInlineEditionAnchor,
        selectedAsBorder,
        canDrop, isOver, nativeIsOver, connectDragSource, isDragging, connectDropTarget,
    } = props;

    const [hover, setHover] = useState(false);

    const inlineEditorRef = useRef(null);

    useEffect(() => {
        if (setInlineEditionAnchor && inlineEditorRef.current) {
            setInlineEditionAnchor(inlineEditorRef.current);
        }
    }, [setInlineEditionAnchor]);

    const handleClick = (event) => {
        if (onClick) {
            onClick(event);
        }
    };

    const handleDoubleClick = (event) => {
        if (onDoubleClick) {
            onDoubleClick(event);
        }
    };

    const entryStyles = {
        ...style,
    };

    if (selected) {
        if (selectedAsBorder) {
            entryStyles.borderWidth = '2px'; // Or theme.shape.borderWidth or similar
            entryStyles.padding = '7px'; // Adjust padding to account for border
        }
    }

    const dynamicClasses = []
    if(className) {
        dynamicClasses.push(className)
    }
    if (selected) {
        dynamicClasses.push('selected')
    }
    if (hover && !noHover) {
        dynamicClasses.push('hover')
    }
    if (isDragging) {
        dynamicClasses.push('dragging');
    }
    if( canDrop && isOver || nativeIsOver){
        dynamicClasses.push('droppable-active')
    }
    if (node && node.getLabel) {
        const nodeLabel = node && node.getLabel ? node.getLabel() : 'Unnamed Node';
        const slug = nodeLabel.toLowerCase().replace(/\s+/g, '-');
        dynamicClasses.push(`ajxp_node_${slug}`)
    }
    if (node && node.getAjxpMime && node.isLeaf) {
        dynamicClasses.push(`ajxp_mime_${node.getAjxpMime()}`)
        dynamicClasses.push(node.isLeaf() ? 'is-leaf' : 'is-folder')
    }

    let {children} = props
    if(!children) {
        children = (
            <React.Fragment>
                {entryRenderIcon && <div className="material-list-icon">{entryRenderIcon(node)}</div>}
                <div className="material-list-text" ref={inlineEditorRef}>
                    {entryRenderFirstLine && <div className="material-list-line-1">{entryRenderFirstLine(node)}</div>}
                    {entryRenderSecondLine && <div className="material-list-line-2">{entryRenderSecondLine(node)}</div>}
                </div>
                {entryRenderActions && <div className="material-list-actions">{entryRenderActions(node)}</div>}
            </React.Fragment>
        )
    }

    return (
        <ContextMenuWrapper
            element={props.element}
            node={node}
            ref={instance => {
                const el = ReactDOM.findDOMNode(instance)
                if (typeof connectDropTarget === 'function') connectDropTarget(el)
                if (typeof connectDragSource === 'function') connectDragSource(el)
            }}
            className={dynamicClasses.join(' ')}
            style={entryStyles}
            onMouseOver={() => !noHover && setHover(true)}
            onMouseOut={() => !noHover && setHover(false)}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
        >
            {children}
        </ContextMenuWrapper>
    );
}));

ModernListEntry.propTypes = {
    node: PropTypes.object,
    element: PropTypes.string,
    selected: PropTypes.bool,
    selectorDisabled: PropTypes.bool,
    onSelect: PropTypes.func,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    entryRenderIcon: PropTypes.func,
    entryRenderActions: PropTypes.func,
    entryRenderFirstLine: PropTypes.func,
    entryRenderSecondLine: PropTypes.func,
    style: PropTypes.object,
    className: PropTypes.string,
    noHover: PropTypes.bool,
    setInlineEditionAnchor: PropTypes.func,
    selectedAsBorder: PropTypes.bool,
};

ModernListEntry.defaultProps = {
    element: 'div',
    selected: false,
    selectorDisabled: false,
    noHover: false,
    selectedAsBorder: false,
    className: '',
    style: {},
};

const DragDropListEntry = flow(
    DragSource(Types.NODE_PROVIDER, nodeDragSource, collect),
    DropTarget(Types.NODE_PROVIDER, nodeDropTarget, collectDrop)
)(ModernListEntry);


export { DragDropListEntry as ModernListEntry, ContextMenuWrapper };
