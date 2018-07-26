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

import React from 'react'
import Utils from './Utils'
import IconButtonMenu from './IconButtonMenu'
import ButtonMenu from './ButtonMenu'
import IconButtonPopover from './IconButtonPopover'
import {FlatButton, IconButton, FloatingActionButton} from 'material-ui'

export default React.createClass({

    propTypes:{
        toolbars:React.PropTypes.array,
        groupOtherList:React.PropTypes.array,
        renderingType:React.PropTypes.string,
        controller:React.PropTypes.instanceOf(Controller),
        toolbarStyle: React.PropTypes.object,
        buttonStyle: React.PropTypes.object,
        fabAction:React.PropTypes.string,
        buttonMenuNoLabel: React.PropTypes.bool
    },

    componentDidMount: function(){
        this._observer = function(){
            if(!this.isMounted()) return;
            this.setState({
                groups:this.props.controller.getToolbarsActions(this.props.toolbars, this.props.groupOtherList)
            });
        }.bind(this);
        if(this.props.controller === pydio.Controller){
            pydio.observe("actions_refreshed", this._observer);
        }else{
            this.props.controller.observe("actions_refreshed", this._observer);
        }
    },

    componentWillUnmount: function(){
        if(this.props.controller === pydio.Controller){
            pydio.stopObserving("actions_refreshed", this._observer);
        }else {
            this.props.controller.stopObserving("actions_refreshed", this._observer);
        }
    },

    componentWillReceiveProps: function(nextProps){
        if(nextProps.toolbars !== this.props.toolbars){
            this.setState({
                groups:this.props.controller.getToolbarsActions(nextProps.toolbars, nextProps.groupOtherList)
            });
        }
    },

    getInitialState: function(){
        return {
            groups:this.props.controller.getToolbarsActions(this.props.toolbars, this.props.groupOtherList)
        };
    },

    getDefaultProps:function(){
        return {
            controller: global.pydio.Controller,
            renderingType:'button',
            groupOtherList:[]
        }
    },

    render: function(){
        let {groups} = this.state;
        let actions = [];
        const {toolbars, renderingType, groupOtherList, buttonStyle,
            tooltipPosition, controller, fabAction, toolbarStyle, buttonMenuNoLabel, buttonMenuPopoverDirection, flatButtonStyle} = this.props;
        let allToolbars = [...toolbars];
        if(groupOtherList.length){
            allToolbars = allToolbars.concat(['MORE_ACTION']);
        }
        allToolbars.map(function(barName){
            if(!groups.has(barName)) return;
            groups.get(barName).map(function(action){
                if(action.deny) return;
                let menuItems, popoverContent, menuTitle , menuIcon;
                let actionName = action.options.name;

                menuTitle = pydio.MessageHash[action.options.text_id] || action.options.text;
                menuIcon  = action.options.icon_class;

                if(barName === 'MORE_ACTION') {
                    let subItems = action.subMenuItems.dynamicItems;
                    let items = [];
                    subItems.map(function (obj) {
                        if (obj.separator) {
                            items.push(obj);
                        } else if (obj.actionId && !obj.actionId.deny) {
                            items.push(obj.actionId.getMenuData());
                        }
                    });
                    menuItems = Utils.pydioActionsToItems(items);
                }else if(action.subMenuItems.staticItems){
                    menuItems = Utils.pydioActionsToItems(action.subMenuItems.staticItems);
                }else if(action.subMenuItems.dynamicBuilder) {
                    menuItems = Utils.pydioActionsToItems(action.subMenuItems.dynamicBuilder(controller));
                }else if(action.subMenuItems.popoverContent) {
                    popoverContent = action.subMenuItems.popoverContent;
                }else{
                }
                let id = 'action-' + action.options.name;
                if(renderingType === 'button-icon'){
                    menuTitle = <span className="button-icon"><span className={"button-icon-icon " + menuIcon}/><span className="button-icon-label">{menuTitle}</span></span>;
                }
                if(menuItems) {
                    if (renderingType === 'button' || renderingType === 'button-icon') {
                        actions.push(<ButtonMenu
                            key={actionName}
                            className={id}
                            buttonTitle={buttonMenuNoLabel ? '' : menuTitle}
                            menuItems={menuItems}
                            buttonLabelStyle={buttonStyle}
                            direction={buttonMenuPopoverDirection}
                        />);
                    } else {
                        actions.push(<IconButtonMenu
                            key={actionName}
                            className={id}
                            onMenuClicked={function (object) {
                                object.payload()
                            }}
                            buttonClassName={menuIcon}
                            buttonTitle={menuTitle}
                            menuItems={menuItems}
                            buttonStyle={buttonStyle}
                            popoverDirection={buttonMenuPopoverDirection}
                        />);
                    }
                }else if(popoverContent){
                    actions.push(<IconButtonPopover
                        key={actionName}
                        className={id}
                        buttonClassName={menuIcon}
                        buttonTitle={menuTitle}
                        buttonStyle={buttonStyle}
                        popoverContent={popoverContent}
                    />);
                }else{
                    let click = function(synthEvent){action.apply();};
                    if(fabAction && fabAction === actionName) {
                        actions.push(<FloatingActionButton
                            key={actionName}
                            onTouchTap={click}
                            iconClassName={menuIcon}
                            mini={true}
                            backgroundColor={toolbarStyle.backgroundColor}
                            style={{position:'absolute', top: -20, left: 10}}
                        />);
                    } else if(renderingType === 'button-icon'){
                        actions.push(<ReactMUI.FlatButton
                            key={actionName}
                            className={id}
                            onTouchTap={click}
                            label={menuTitle}
                            labelStyle={buttonStyle}
                        />);
                    }else if(renderingType === 'button'){
                        actions.push(<FlatButton
                            key={actionName}
                            className={id}
                            onTouchTap={click}
                            label={menuTitle}
                            labelStyle={buttonStyle}
                            style={flatButtonStyle}
                        />);
                    }else{
                        actions.push(<IconButton
                            key={actionName}
                            iconClassName={menuIcon + ' ' + id}
                            iconStyle={buttonStyle}
                            onTouchTap={click}
                            tooltip={menuTitle}
                            tooltipPosition={tooltipPosition}
                        />);
                    }
                }
            });
        });
        let cName = this.props.className ? this.props.className : '';
        cName += ' ' + 'toolbar';
        if(!actions.length){
            cName += ' empty-toolbar';
        }
        let style = {...toolbarStyle};
        return <div className={cName} style={style} id={this.props.id}>{actions}</div>
    }

});

