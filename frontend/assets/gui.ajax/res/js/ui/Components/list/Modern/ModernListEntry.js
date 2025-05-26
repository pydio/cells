import React, {useState, useRef, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';
import { FontIcon } from 'material-ui';
import {muiThemeable} from "material-ui/styles";
import ReactDOM from "react-dom";
import {DragSource, DropTarget, flow} from "react-dnd";
import { Types, collect, collectDrop, nodeDragSource, nodeDropTarget } from '../../util/DND';
const {withContextMenu} = Pydio.requireLib('hoc');

const ContextMenuWrapper = withContextMenu((props) => {
    const {muiTheme, element, node, iconCell, firstLine, secondLine, ...others} = props;
    return React.createElement(element, {...others})
});


const ModernListEntry = muiThemeable()((props) => {
    const {
        node,
        selected,
        onClick,
        onDoubleClick,
        iconCell,
        mainIcon,
        firstLine,
        secondLine,
        actions,
        style,
        className,
        noHover,
        setInlineEditionAnchor,
        selectedAsBorder,
        canDrop, isOver, nativeIsOver, connectDragSource, connectDropTarget,
        muiTheme: theme
        // nativeIsOver, // Replaced by isOver from useDrop
    } = props;

    const [hover, setHover] = useState(false);
    //const theme = useTheme();

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

    if (!noHover && hover && !selected) {
        //entryStyles.backgroundColor = theme.palette.action.hover;
    }

    if (selected) {
        if (selectedAsBorder) {
            //entryStyles.borderColor = theme.palette.primary.main;
            entryStyles.borderWidth = '2px'; // Or theme.shape.borderWidth or similar
            entryStyles.padding = '7px'; // Adjust padding to account for border
        } else {
            //entryStyles.backgroundColor = theme.palette.action.selected;
        }
    }

    const nodeLabel = node && node.getLabel ? node.getLabel() : 'Unnamed Node';
    const slug = nodeLabel.toLowerCase().replace(/\s+/g, '-');


    let dynamicClasses = className || '';
    if (selected) dynamicClasses += ' selected';
    if (hover && !noHover) dynamicClasses += ' hover';
    //if (isDragging) dynamicClasses += ' dragging';
    if( canDrop && isOver || nativeIsOver){
        dynamicClasses += 'droppable-active'
    }
    if (node && node.getAjxpMime && node.isLeaf) {
        dynamicClasses += ` ajxp_mime_${node.getAjxpMime()}`;
        dynamicClasses += node.isLeaf() ? ' is-leaf' : ' is-folder';
    }
    dynamicClasses += ` ajxp_node_${slug}`;

    let {children} = props
    if(!children) {
        children = (
            <React.Fragment>
                {iconCell && <div className="material-list-icon">{iconCell}</div>}
                {!iconCell && mainIcon && (
                    <div className="material-list-icon">
                        <FontIcon className={`mdi mdi-${mainIcon}`} />
                    </div>
                )}
                <div className="material-list-text" ref={inlineEditorRef}>
                    {firstLine && <div className="material-list-line-1">{firstLine}</div>}
                    {secondLine && <div className="material-list-line-2">{secondLine}</div>}
                </div>
                {actions && <div className="material-list-actions">{actions}</div>}
            </React.Fragment>
        )
    }


    return (
        <ContextMenuWrapper
            element={props.element}
            node={node}
            ref={instance => {
                const node = ReactDOM.findDOMNode(instance)
                if (typeof connectDropTarget === 'function') connectDropTarget(node)
                if (typeof connectDragSource === 'function') connectDragSource(node)
            }}
            className={dynamicClasses}
            style={entryStyles}
            onMouseOver={() => !noHover && setHover(true)}
            onMouseOut={() => !noHover && setHover(false)}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
        >
            {children}
        </ContextMenuWrapper>
    );
});

ModernListEntry.propTypes = {
    node: PropTypes.object,
    element: PropTypes.string,
    selected: PropTypes.bool,
    selectorDisabled: PropTypes.bool,
    onSelect: PropTypes.func,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    iconCell: PropTypes.element,
    mainIcon: PropTypes.string,
    firstLine: PropTypes.node,
    secondLine: PropTypes.node,
    actions: PropTypes.element,
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


export { DragDropListEntry as ModernListEntry };
