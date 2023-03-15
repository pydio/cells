/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React from 'react';
import PropTypes from 'prop-types';
import UserAvatar from '../avatar/UserAvatar'
import {IconButton, Checkbox, IconMenu, RaisedButton, ListItem, FontIcon, Avatar, Divider, Subheader, List, TextField} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import EmptyStateView from '../../views/EmptyStateView'
import AlphaPaginator from './AlphaPaginator'
import SearchForm from './SearchForm'
import Color from 'color'
import DOMUtils from 'pydio/util/dom'
import CellActionsRenderer from '../avatar/CellActionsRenderer'
import ListStylesCompact from "./ListStylesCompact";
const {Loader, PydioContextConsumer} = require('pydio').requireLib('boot');

class UsersList extends React.Component{

    constructor(props, context){
        super(props, context);
        this.state = {select: false, selection:[], editLabel: false};
    }

    onLabelKeyEnter(e){
        if (e.key === 'Enter'){
            this.updateLabel();
        }
    }
    onLabelChange(e, value){
        this.setState({label: value});
    }
    updateLabel(){
        if(this.state.label !== this.props.item.label){
            this.props.onEditLabel(this.props.item, this.state.label);
        }
        this.setState({editLabel: false});
    }


    render(){

        const {item, mode, paginatorType, paginatorFolder, loading, enableSearch, showSubheaders,
            getMessage, actionsPanel, muiTheme, bookColumn, pydio, reloadAction} = this.props;
        let {listStyles = {}} = this.props;
        let className;
        if (mode === 'selector' || mode === 'inner'){
            listStyles = ListStylesCompact;
            className = 'compact';
        }

        const avatarSize = listStyles.avatar ? listStyles.avatar.avatarSize : 36;

        const folders = item.collections || [];
        const leafs = item.leafs || [];
        let foldersSubHeader = [];
        let usersSubHeader = [];

        if(paginatorFolder) {
            foldersSubHeader.push({subheader:<AlphaPaginator {...this.props} style={{lineHeight: '20px',padding: '14px 0'}} />});
        } else if(folders.length && (leafs.length || showSubheaders)) {
            foldersSubHeader.push({subheader:getMessage('532')})
        }
        if(paginatorType) {
            usersSubHeader.push({subheader: <AlphaPaginator {...this.props} style={{lineHeight: '20px',padding: '14px 0'}} />})
        } else if(showSubheaders) {
            usersSubHeader.push({subheader: getMessage('249')});
        }
        const items = [...foldersSubHeader, ...folders, ...usersSubHeader, ...leafs];
        const total = items.length;
        let elements = [];
        const toggleSelect = () => {this.setState({select:!this.state.select, selection:[]})};
        const createAction = () => {this.props.onCreateAction(item)};
        const deleteAction = () => {this.props.onDeleteAction(item, this.state.selection); this.setState({select: false, selection: []})};

        const accentColor = muiTheme.palette.accent2Color;
        const appBar = muiTheme.appBar;
        let stylesProps = {
            toolbarHeight: mode === 'book' ? 56 : 48,
            toolbarBgColor: mode === 'book' ? (this.state.select?accentColor : '#fafafa') : appBar.color,
            titleFontsize: mode === 'book' ? 20 : 16,
            titleFontWeight: 400,
            titleColor: mode === 'book' ? this.state.select?'white':'rgba(0,0,0,0.87)' : appBar.textColor,
            titlePadding: 10,
            button: {
                border: '1px solid ' + accentColor,
                borderRadius: '50%',
                margin: '0 4px',
                width: 36,
                height: 36,
                padding: 6
            },
            icon : {
                fontSize: 22,
                color: accentColor
            }
        };
        if(bookColumn){
            const colorHue = Color(muiTheme.palette.primary1Color).hsl().array()[0];
            const headerTitle = new Color({h:colorHue,s:30,l:43});
            stylesProps.toolbarBgColor = 'transparent';
            stylesProps.titleColor = headerTitle.toString();
            stylesProps.titleFontsize = 14;
            stylesProps.titleFontWeight = 500;
            stylesProps.titlePadding = '10px 6px 10px 16px';
            stylesProps.button.margin = '0';
            stylesProps.button.border = '0';
            stylesProps.icon.color = '#ccc';
        }
        let searchProps = {
            style:{flex:1, minWidth: 110},
        };
        if (mode === 'selector'){
            searchProps.inputStyle={color:'white'};
            searchProps.hintStyle={color:'rgba(255,255,255,.5)'};
            searchProps.underlineStyle={borderColor:'rgba(255,255,255,.5)'};
            searchProps.underlineFocusStyle={borderColor:'white'};
        }

        let label = item.label;
        if(this.props.onEditLabel && !this.state.select){
            if(this.state.editLabel){
                label = (
                    <div style={{display:'flex', alignItems:'center', flex: 1}}>
                        <TextField style={{fontSize: 20}} value={this.state.label} onChange={this.onLabelChange.bind(this)} onKeyDown={this.onLabelKeyEnter.bind(this)}/>
                        <IconButton iconStyle={{color: '#e0e0e0'}} secondary={true} iconClassName={"mdi mdi-content-save"} tooltip={getMessage(48)} onClick={() => {this.updateLabel()}}/>
                    </div>
                );
            } else {
                label = (
                    <div style={{display:'flex', alignItems:'center', flex: 1}}>
                        {label}
                        <IconButton iconStyle={{color: '#e0e0e0'}} iconClassName={"mdi mdi-pencil"} tooltip={getMessage(48)} onClick={() => {this.setState({editLabel:true, label:item.label})}}/>
                    </div>
                );
            }
        }
        let createIcon = 'mdi mdi-account-plus';
        if(item.actions && item.actions.type === 'teams'){
            createIcon = 'mdi mdi-account-multiple-plus';
        }
        const ellipsis = {
            whiteSpace:'nowrap',
            textOverflow:'ellipsis',
            overflow:'hidden'
        };
        const toolbar = (
            <div style={{padding: stylesProps.titlePadding, height:stylesProps.toolbarHeight, minHeight:stylesProps.toolbarHeight, borderRadius: '2px 2px 0 0', display:'flex', alignItems:'center', transition:DOMUtils.getBeziersTransition()}}>
                {mode === "selector" && item._parent && <IconButton style={{marginLeft: -10}} iconStyle={{color:stylesProps.titleColor}} iconClassName="mdi mdi-chevron-left" onClick={() => {this.props.onFolderClicked(item._parent)}}/>}
                {mode === 'book' && total > 0 && item.actions && item.actions.multiple && <Checkbox style={{width:'initial', marginLeft: this.state.select?7:14}} checked={this.state.select} onCheck={toggleSelect}/>}
                <div style={{flex:2, fontSize:stylesProps.titleFontsize, color:stylesProps.titleColor, fontWeight:stylesProps.titleFontWeight, ...ellipsis}}>{label}</div>
                {(mode === 'book' || (mode === 'selector' && bookColumn)) && item.actions && item.actions.create && !this.state.select && <IconButton style={stylesProps.button} iconStyle={stylesProps.icon} iconClassName={createIcon} tooltipPosition={"bottom-left"} tooltip={getMessage(item.actions.create)} onClick={createAction}/>}
                {bookColumn && !item._parent && <IconButton style={stylesProps.button} iconStyle={stylesProps.icon} iconClassName={"mdi mdi-window-restore"} tooltipPosition={"bottom-left"} tooltip={pydio.MessageHash['411']} onClick={()=>{pydio.Controller.fireAction('open_address_book')}}/>}
                {mode === 'book' && item.actions && item.actions.remove && this.state.select && <RaisedButton secondary={true} label={getMessage(item.actions.remove)} disabled={!this.state.selection.length} onClick={deleteAction}/>}
                {!this.state.select && actionsPanel}
                {enableSearch && !bookColumn && <SearchForm searchLabel={this.props.searchLabel} onSearch={this.props.onSearch} {...searchProps}/>}
                {reloadAction && (mode === 'book' || (mode === 'selector' && bookColumn)) && <IconButton style={stylesProps.button} iconStyle={stylesProps.icon} iconClassName={"mdi mdi-refresh"} tooltipPosition={"bottom-left"} tooltip={pydio.MessageHash['149']} onClick={reloadAction} disabled={loading}/>}
            </div>
        );
        // PARENT NODE
        if(item._parent && mode === 'book' && item._parent._parent && item._parent.id !== 'teams'){
            elements.push(
                <ListItem
                    key={'__parent__'}
                    primaryText={".."}
                    onClick={(e) => {e.stopPropagation(); this.props.onFolderClicked(item._parent)}}
                    leftAvatar={<Avatar icon={<FontIcon className={'mdi mdi-arrow-up'}/>} size={avatarSize} />}
                    {...listStyles.listItem}
                />
            );
            if(total){
                elements.push(<Divider inset={true} key={'parent-divider'}/>);
            }
        }
        // ITEMS
        items.forEach(function(item, index){
            if(item.subheader){
                elements.push(<Subheader key={item.subheader}>{item.subheader}</Subheader>);
                return;
            }
            const fontIcon = (
                <UserAvatar
                    avatarSize={avatarSize}
                    pydio={this.props.pydio || pydio}
                    userId={item.id}
                    userLabel={item.label}
                    avatar={item.avatar}
                    icon={item.icon}
                    idmUser={item.IdmUser}
                    userType={item.type || 'group'}
                    avatarOnly={true}
                    useDefaultAvatar={true}
                    style={listStyles.avatar?listStyles.avatar.style:{}}
                />
            );
            let rightIconButton;
            let touchTap = (e)=>{e.stopPropagation(); this.props.onItemClicked(item)};
            if(folders.indexOf(item) > -1 && this.props.onFolderClicked){
                touchTap = (e)=>{e.stopPropagation(); this.props.onFolderClicked(item) };
                if(mode === 'selector' && !item._notSelectable && !this.props.usersOnly){
                    rightIconButton = (
                        <IconButton
                            iconClassName={"mdi mdi-account-multiple-plus"}
                            tooltip={getMessage('addressbook.pick.group')}
                            tooltipPosition="top-left"
                            iconStyle={{color: 'rgba(0,0,0,0.33)'}}
                            onClick={()=>{this.props.onItemClicked(item)}}
                            {...listStyles.iconButton}
                        />
                    );
                }
            }else if(mode === 'inner' && this.props.onDeleteAction){
                rightIconButton = (
                    <IconButton
                        iconClassName={"mdi mdi-delete"}
                        tooltip={getMessage(257)}
                        tooltipPosition="top-left"
                        iconStyle={{color: 'rgba(0,0,0,0.13)', hoverColor:'rgba(0,0,0,0.53)'}}
                        onClick={()=>{this.props.onDeleteAction(this.props.item, [item])}}
                        {...listStyles.iconButton}
                    />
                );
            }
            if(bookColumn && this.props.actionsForCell && item.type){
                const menuItems = new CellActionsRenderer(pydio, this.props.actionsForCell, null, item).renderItems();
                if(menuItems.length){
                    rightIconButton = (
                        <IconMenu
                            {...listStyles.iconMenu}
                            iconButtonElement={<IconButton iconClassName="mdi mdi-dots-vertical" iconStyle={{color: 'rgba(0,0,0,.33)'}} {...listStyles.iconButton}/>}
                            targetOrigin={{horizontal:'right', vertical:'top'}}
                            anchorOrigin={{horizontal:'right', vertical:'top'}}
                            desktop={true}
                        >{menuItems}</IconMenu>
                    );
                } else {
                    rightIconButton = null;
                }
            }
            const select = (e, checked) => {
                if(checked) {
                    this.setState({selection: [...this.state.selection, item]});
                }else {
                    const stateSel = this.state.selection;
                    const selection = [...stateSel.slice(0, stateSel.indexOf(item)), ...stateSel.slice(stateSel.indexOf(item)+1)];
                    this.setState({selection: selection});
                }
            };
            elements.push(<ListItem
                key={item.id}
                primaryText={<div style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.label}</div>}
                onClick={touchTap}
                disabled={mode === 'inner'}
                leftAvatar={!this.state.select && fontIcon}
                rightIconButton={rightIconButton}
                leftCheckbox={this.state.select && <Checkbox checked={this.state.selection.indexOf(item) > -1} onCheck={select}/>}
                {...listStyles.listItem}
            />);
            if(mode !== 'inner' && index < total - 1){
                elements.push(<Divider inset={true} key={item.id + '-divider'} {...listStyles.divider}/>);
            }
        }.bind(this));

        let emptyState;
        if(!elements.length){
            let emptyStateProps = {
                style               : {backgroundColor: 'transparent', minHeight:300},
                iconClassName       : 'mdi mdi-account-off',
                primaryTextId       : this.props.emptyStatePrimaryText || getMessage(629),
                secondaryTextId     : mode === 'book' ? ( this.props.emptyStateSecondaryText || null ) : null
            };
            if(mode === 'book' && item.actions && item.actions.create){
                emptyStateProps = {
                    ...emptyStateProps,
                    actionLabelId: getMessage(item.actions.create),
                    actionCallback: createAction
                };
            }
            if(className === 'compact') {
                emptyStateProps = {
                    ...emptyStateProps,
                    style: {backgroundColor: 'transparent', minHeight: 150},
                    iconStyle:{fontSize: 40},
                    legendStyle: {fontSize: 13}
                }
            }
            emptyState = <EmptyStateView {...emptyStateProps}/>;
        }

        return (
            <div style={{flex:1, flexDirection:'column', display:'flex', width:'100%', overflowX: 'hidden'}} onClick={this.props.onClick} className={className}>
                {mode !== 'inner' && !this.props.noToolbar && toolbar}
                {!emptyState && !loading &&
                    <List style={{flex: 1, overflowY: mode !== 'inner' ? 'auto' : 'initial'}}>
                        {this.props.subHeader && <Subheader>{this.props.subHeader}</Subheader>}
                        {elements}
                    </List>
                }
                {loading && <Loader style={{flex:1}}/>}
                {!loading && emptyState}
                {mode === 'selector' && enableSearch && bookColumn &&
                    <SearchForm
                        searchLabel={this.props.searchLabel}
                        onSearch={this.props.onSearch}
                        style={{padding:'0 20px', minWidth:null}}
                        underlineShow={false}
                    />
                }
            </div>
        );
    }

}

UsersList.propTypes ={
    item: PropTypes.object,
    onCreateAction:PropTypes.func,
    onDeleteAction:PropTypes.func,
    onItemClicked:PropTypes.func,
    onFolderClicked:PropTypes.func,
    onEditLabel:PropTypes.func,
    mode:PropTypes.oneOf(['book', 'selector', 'inner']),
    bookColumn:PropTypes.bool
};

UsersList = PydioContextConsumer(UsersList);
UsersList = muiThemeable()(UsersList);

export {UsersList as default}