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

import PropTypes from 'prop-types';

import React from 'react';
import createReactClass from 'create-react-class';
import Utils from './Utils'
import IconButtonMenu from './IconButtonMenu'
import ButtonMenu from './ButtonMenu'
import ButtonComposed from './ButtonComposed'
import IconButtonPopover from './IconButtonPopover'
import {FlatButton, FloatingActionButton} from 'material-ui'
import {IconButton} from './ThemedContainer'
import {debounce} from 'lodash';

export default createReactClass({
    displayName: 'Toolbar',

    propTypes:{
        toolbars:PropTypes.array,
        groupOtherList:PropTypes.array,
        renderingType:PropTypes.string,
        controller:PropTypes.instanceOf(Controller),
        toolbarStyle: PropTypes.object,
        buttonStyle: PropTypes.object,
        fabAction:PropTypes.string,
        buttonMenuNoLabel: PropTypes.bool
    },

    componentDidMount(){
        const observer = function(){
            if(!this.isMounted()) return;
            this.setState({
                groups:this.props.controller.getToolbarsActions(this.props.toolbars, this.props.groupOtherList)
            });
        }.bind(this);
        this._observer = debounce(observer, 50);
        if(this.props.controller === pydio.Controller){
            pydio.observe("actions_refreshed", this._observer);
        }else{
            this.props.controller.observe("actions_refreshed", this._observer);
        }
    },

    componentWillUnmount(){
        if(this.props.controller === pydio.Controller){
            pydio.stopObserving("actions_refreshed", this._observer);
        }else {
            this.props.controller.stopObserving("actions_refreshed", this._observer);
        }
    },

    componentWillReceiveProps(nextProps){
        if(nextProps.toolbars !== this.props.toolbars){
            this.setState({
                groups:this.props.controller.getToolbarsActions(nextProps.toolbars, nextProps.groupOtherList)
            });
        }
    },

    getInitialState(){
        return {
            groups:this.props.controller.getToolbarsActions(this.props.toolbars, this.props.groupOtherList)
        };
    },

    getDefaultProps(){
        return {
            controller: global.pydio.Controller,
            renderingType:'button',
            groupOtherList:[]
        }
    },

    render(){
        let {groups} = this.state;
        let actions = [];
        const {toolbars, renderingType, groupOtherList, buttonStyle,mergeItemsAsOneMenu,
            tooltipPosition, controller, fabAction, fabButtonStyle = {}, toolbarStyle, buttonMenuNoLabel, buttonMenuPopoverDirection, flatButtonStyle} = this.props;
        let allToolbars = [...toolbars];
        if(groupOtherList.length){
            allToolbars = allToolbars.concat(['MORE_ACTION']);
        }
        let hasFab = false;
        let mergedMenuItems = [];
        allToolbars.map(barName => {
            if(!groups.has(barName)) {
                return;
            }
            groups.get(barName).map(action => {
                if(action.deny) {
                    return;
                }
                let menuItems, popoverContent, menuTitle , menuIcon, menuItemsUseMasterAction;
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
                    menuIcon = "mdi mdi-dots-vertical";
                }else if(action.subMenuItems.staticItems){
                    menuItems = Utils.pydioActionsToItems(action.subMenuItems.staticItems);
                }else if(action.subMenuItems.dynamicBuilder) {
                    menuItems = Utils.pydioActionsToItems(action.subMenuItems.dynamicBuilder(controller));
                }else if(action.subMenuItems.popoverContent) {
                    popoverContent = action.subMenuItems.popoverContent;
                }
                if(menuItems && action.subMenuItems.masterAction) {
                    const masterAction = controller.getActionByName(action.subMenuItems.masterAction);
                    if(masterAction && !masterAction.deny){
                        menuItemsUseMasterAction = () => {masterAction.apply()};
                    }
                }
                if (mergeItemsAsOneMenu && menuItems !== undefined) {
                    mergedMenuItems = [...mergedMenuItems, {subHeader:menuTitle}, ...menuItems, {separator:true}];
                    return;
                }
                let id = 'action-' + action.options.name;
                if(renderingType === 'button-icon'){
                    menuTitle = <span className="button-icon"><span className={"button-icon-icon " + menuIcon}/><span className="button-icon-label">{menuTitle}</span></span>;
                }
                if(menuItems) {
                    if (renderingType === 'button' || renderingType === 'button-icon') {
                        if (menuItemsUseMasterAction){
                            actions.push(<ButtonComposed
                                key={actionName}
                                className={id}
                                buttonTitle={menuTitle}
                                menuItems={menuItems}
                                masterAction={menuItemsUseMasterAction}
                                buttonStyle={flatButtonStyle}
                                buttonLabelStyle={buttonStyle}
                                direction={buttonMenuPopoverDirection}
                            />);

                        } else {
                            actions.push(<ButtonMenu
                                key={actionName}
                                className={id}
                                buttonTitle={buttonMenuNoLabel ? '' : menuTitle}
                                menuItems={menuItems}
                                buttonStyle={flatButtonStyle}
                                buttonLabelStyle={buttonStyle}
                                direction={buttonMenuPopoverDirection}
                            />);
                        }
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
                            style={flatButtonStyle}
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
                    let click = () => {action.apply();};
                    if(fabAction && fabAction === actionName) {
                        hasFab = true;
                        actions.push(<FloatingActionButton
                            key={actionName}
                            onClick={click}
                            iconClassName={menuIcon}
                            mini={true}
                            backgroundColor={fabButtonStyle.backgroundColor}
                            style={{position:'absolute', top: -20, left: 10}}
                        />);
                    } else if(renderingType === 'button-icon'){
                        actions.push(<FlatButton
                            key={actionName}
                            className={id}
                            onClick={click}
                            label={menuTitle}
                            labelStyle={buttonStyle}
                            style={flatButtonStyle}
                        />);
                    }else if(renderingType === 'button'){
                        actions.push(<FlatButton
                            key={actionName}
                            className={id}
                            onClick={click}
                            label={menuTitle}
                            labelStyle={buttonStyle}
                            style={flatButtonStyle}
                        />);
                    }else{
                        actions.push(<IconButton
                            key={actionName}
                            iconClassName={menuIcon + ' ' + id}
                            iconStyle={buttonStyle}
                            style={flatButtonStyle}
                            onClick={click}
                            tooltip={menuTitle}
                            tooltipPosition={tooltipPosition}
                        />);
                    }
                }
            });
        });
        if(mergeItemsAsOneMenu && mergedMenuItems.length) {
            // remove last separator
            mergedMenuItems.pop();
            const {mergedMenuIcom, mergedMenuTitle} = this.props;
            actions.push(<IconButtonMenu
                key={toolbars.join('-')}
                className={'toolbar-' + toolbars.join('-')}
                onMenuClicked={function (object) {
                    object.payload()
                }}
                buttonClassName={mergedMenuIcom}
                buttonTitle={mergedMenuTitle}
                menuItems={mergedMenuItems}
                buttonStyle={buttonStyle}
                style={flatButtonStyle}
                popoverDirection={buttonMenuPopoverDirection}
            />);
        }

        let cName = this.props.className ? this.props.className : '';
        cName += ' ' + 'toolbar';
        if(!actions.length){
            cName += ' empty-toolbar';
        }
        let style = {...toolbarStyle};
        if (hasFab) {
            style = {...toolbarStyle, minHeight: 41}
        }
        return <div className={cName} style={style} id={this.props.id}>{actions}</div>
    },
});

