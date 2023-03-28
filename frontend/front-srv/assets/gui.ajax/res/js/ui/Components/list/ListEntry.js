/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {createRef} from 'react'
import Pydio from 'pydio'
import LangUtils from 'pydio/util/lang'
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Types, collect, collectDrop, nodeDragSource, nodeDropTarget } from '../util/DND';
import { DragSource, DropTarget, flow } from 'react-dnd';
import { Checkbox, FontIcon } from 'material-ui';
import { muiThemeable } from 'material-ui/styles';
import Color from 'color';
const {withContextMenu} = Pydio.requireLib('hoc');

/**
 * Material List Entry
 */
class ListEntry extends React.Component {

    constructor(props) {
        super(props);
        this.inlineEditorRef = createRef();
    }

    componentDidMount() {
        const {setInlineEditionAnchor} = this.props;
        if(setInlineEditionAnchor && this.inlineEditorRef.current) {
            setInlineEditionAnchor(this.inlineEditorRef.current)
        }
    }

    onClick(event) {
        if(this.props.showSelector) {
            if(this.props.selectorDisabled) return;
            this.props.onSelect(this.props.node, event);
            event.stopPropagation();
            event.preventDefault();
        }else if(this.props.onClick){
            this.props.onClick(this.props.node, event);
        }
    }

    onDoubleClick(event) {
        if(this.props.onDoubleClick){
            this.props.onDoubleClick(this.props.node, event);
        }
    }

    render() {

        let selector, icon;

        const {node, showSelector, selected, selectorDisabled, firstLine,
            secondLine, thirdLine, style, actions, iconCell, mainIcon, className, muiTheme,
            canDrop, isOver, nativeIsOver, connectDragSource, connectDropTarget, selectedAsBorder} = this.props

        let mainClasses = ['material-list-entry', 'material-list-entry-' + (thirdLine?3:secondLine?2:1) + '-lines'];
        if(className) {
            mainClasses.push(className);
        }

        if(showSelector){
            selector = (
                <div className="material-list-selector">
                    <Checkbox checked={selected} ref="selector" disabled={selectorDisabled}/>
                </div>
            );
        }

        if(iconCell){
            icon = this.props.iconCell;
        }else if(this.props.mainIcon){
            const style = {
                fontSize: 18, color: '#FFF', display: 'inline-block', margin: 16, backgroundColor: 'rgb(189, 189, 189)', padding: '7px 3px', width: 33, height: 33, textAlign: 'center'
            };
            icon = <FontIcon className={"mui-font-icon " + this.props.mainIcon} style={style}/>;
        }

        if( canDrop && isOver || nativeIsOver){
            mainClasses.push('droppable-active');
        }

        if(node){
            mainClasses.push('listentry_' + LangUtils.computeStringSlug(node.getPath()));
            mainClasses.push('ajxp_node_' + (node.isLeaf()?'leaf':'collection'));
            if(node.getAjxpMime()){
                mainClasses.push('ajxp_mime_' + node.getAjxpMime())
            }
            if(node.getMetadata().has('local:entry-classes')){
                mainClasses.push(...node.getMetadata().get('local:entry-classes'))
            }
        }

        let additionalStyle = {
            /*transition:'background-color 250ms cubic-bezier(0.23, 1, 0.32, 1) 0ms, color 250ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'*/
        };
        if(this.state && this.state.hover && !this.props.noHover){
            additionalStyle = {
                ...additionalStyle,
                backgroundColor: muiTheme.darkMode? 'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)',
                borderBottom: '1px solid transparent'
            };
        }
        if(selected){
            const selectionColor = muiTheme.palette.accent2Color;
            const selectionColorDark = Color(selectionColor).dark();
            if(selectedAsBorder){
                additionalStyle = {
                    ...additionalStyle,
                    boxShadow: '0 0 0 2px ' + selectionColor + ',rgba(0, 0, 0, .4) 0px 0px 10px'
                };
            } else {
                additionalStyle = {
                    ...additionalStyle,
                    backgroundColor: selectionColor,
                    color: selectionColorDark ? 'white' : 'rgba(0,0,0,.87)'
                };
            }
            mainClasses.push('selected');
            mainClasses.push('selected-' + (selectionColorDark?'dark':'light'));
        }


        return (
            <ContextMenuWrapper
                {...this.props}
                ref={instance => {
                    const node = ReactDOM.findDOMNode(instance)
                    if (typeof connectDropTarget === 'function') connectDropTarget(node)
                    if (typeof connectDragSource === 'function') connectDragSource(node)
                }}
                onClick={this.onClick.bind(this)}
                onDoubleClick={showSelector? null : this.onDoubleClick.bind(this)}
                className={mainClasses.join(' ')}
                onMouseOver={()=>{this.setState({hover:true})}}
                onMouseOut={()=>{this.setState({hover:false})}}
                style={{...style, ...additionalStyle}}>
                {selector}
                <div className={"material-list-icon" + ((mainIcon || iconCell)?"":" material-list-icon-none")}>
                    {icon}
                </div>
                <div className="material-list-text">
                    <div key="line-1" className="material-list-line-1" ref={this.inlineEditorRef}>{firstLine}</div>
                    <div key="line-2" className="material-list-line-2">{secondLine}</div>
                    <div key="line-3" className="material-list-line-3">{thirdLine}</div>
                </div>
                <div className="material-list-actions">
                    {actions}
                </div>
            </ContextMenuWrapper>
        );
    }
}

let ContextMenuWrapper = (props) => {
    const {muiTheme, node, iconCell, firstLine, secondLine, ...others} = props;
    return (
        <div {...others}/>
    )
}
ContextMenuWrapper = withContextMenu(ContextMenuWrapper)

ListEntry.propTypes = {
    showSelector:PropTypes.bool,
    selected:PropTypes.bool,
    selectorDisabled:PropTypes.bool,
    onSelect:PropTypes.func,
    onClick:PropTypes.func,
    iconCell:PropTypes.element,
    mainIcon:PropTypes.string,
    firstLine:PropTypes.node,
    secondLine:PropTypes.node,
    thirdLine:PropTypes.node,
    actions:PropTypes.element,
    activeDroppable:PropTypes.bool,
    className:PropTypes.string,
    style: PropTypes.object,
    noHover: PropTypes.bool
}

ListEntry = muiThemeable()(ListEntry);

let DragDropListEntry = flow(
    DragSource(Types.NODE_PROVIDER, nodeDragSource, collect),
    DropTarget(Types.NODE_PROVIDER, nodeDropTarget, collectDrop)
)(ListEntry);

export {DragDropListEntry as DragDropListEntry, ListEntry as ListEntry, ContextMenuWrapper}
