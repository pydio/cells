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
import {IconButton, Checkbox, IconMenu, ListItem, FontIcon, Avatar, Divider, Subheader, List} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import EmptyStateView from '../../views/EmptyStateView'
import AlphaPaginator from './AlphaPaginator'
import SearchForm from './SearchForm'
import CellActionsRenderer from '../avatar/CellActionsRenderer'
import ListStylesCompact from "./ListStylesCompact";
import Model from "./Model";
const {Loader, PydioContextConsumer} = require('pydio').requireLib('boot');

class UsersList extends React.Component{

    constructor(props, context){
        super(props, context);
    }

    render(){

        const {pydio, item, mode, loading, showAllParents,
            enableSearch, searchLabel, onSearch, getMessage, bookColumn, toolbar, style} = this.props;

        let {model} = this.props;
        if(!model) {
            model = new Model(pydio, 'inner')
        }

        const multipleSelection = model.getMultipleSelection()
        const selectionMode = model.getSelectionMode()

        let {listStyles = {}} = this.props;
        if (mode === 'selector' || mode === 'inner'){
            listStyles = ListStylesCompact;
        }
        const {className} = listStyles;


        const avatarSize = listStyles.avatar ? listStyles.avatar.avatarSize : 36;

        const folders = item.collections || [];
        const leafs = item.leafs || [];
        let foldersSubHeader = [];
        let usersSubHeader = [];

        let emptyStatePrimary;
        let emptyStateSecondary;
        let showSubheaders
        let paginatorProps = {}
        if(item.id === 'teams'){
            paginatorProps = {
                paginatorFolder: item.pagination?'numeric':null,
                paginatorLabel: item.label,
                paginatorCallback: (l) => model.reloadCurrentAtPage(l)
            };
            if (model.teamsEditable()){
                emptyStatePrimary = getMessage(571, '');
                emptyStateSecondary = getMessage(572, '');
            } else {
                emptyStatePrimary = getMessage('571.readonly', '');
                emptyStateSecondary = getMessage('572.readonly', '');
            }
        }else if(item.id === 'ext'){
            emptyStatePrimary = getMessage(585, '');
            emptyStateSecondary = getMessage(586, '');
            if(item.pagination){
                showSubheaders = true
                paginatorProps = {
                    paginatorType: 'alpha',
                    paginatorCallback: (l) => model.reloadCurrentAtPage(l)
                };
            }
        }else if(model.contextIsGroup() || model.contextIsTeam()){
            showSubheaders = true
            paginatorProps = {
                paginatorType: !(item.currentParams && item.currentParams.has_search) && 'alpha',
                paginatorCallback: (l) => model.reloadCurrentAtPage(l),
            }
        }

        if(paginatorProps.paginatorFolder) {
            foldersSubHeader.push({subheader:<AlphaPaginator {...this.props} {...paginatorProps} style={{lineHeight: '20px',padding: '14px 0'}} />});
        } else if(folders.length && (leafs.length || showSubheaders)) {
            foldersSubHeader.push({subheader:getMessage('532')})
        }
        if(paginatorProps.paginatorType) {
            usersSubHeader.push({subheader: <AlphaPaginator {...this.props} {...paginatorProps} style={{lineHeight: '20px',padding: '14px 0'}} />})
        } else if(showSubheaders) {
            usersSubHeader.push({subheader: getMessage('249')});
        }
        const items = [...foldersSubHeader, ...folders, ...usersSubHeader, ...leafs];
        const total = items.length;
        let elements = [];

        // PARENT NODE
        if(mode === 'book' && item._parent && ((item._parent._parent && item._parent.id !== 'teams')|| showAllParents)){
            elements.push(
                <ListItem
                    key={'__parent__'}
                    primaryText={".."}
                    onClick={(e) => {e.stopPropagation(); model.setContext(item._parent)}}
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
            if(folders.indexOf(item) > -1 /*&& onFolderClicked*/){
                touchTap = (e)=>{e.stopPropagation(); model.setContext(item) };
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
            const onCheck = (e, checked) => {
                if(checked) {
                    model.setMultipleSelection([...multipleSelection, item])
                }else {
                    const newSelection = [...multipleSelection.slice(0, multipleSelection.indexOf(item)), ...multipleSelection.slice(multipleSelection.indexOf(item)+1)];
                    model.setMultipleSelection(newSelection)
                }
            };
            const primStyle = {overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}
            let secondaryText;
            if(item.secondaryText){
                primStyle.fontWeight=500;
                secondaryText = <span style={{fontSize: 13, color:'var(--md-sys-color-on-surface-variant)'}}>{item.secondaryText}</span>
            }
            elements.push(<ListItem
                key={item.id}
                primaryText={<div style={primStyle}>{item.label}</div>}
                secondaryText={secondaryText}
                onClick={touchTap}
                disabled={mode === 'inner'}
                leftAvatar={!selectionMode && fontIcon}
                rightIconButton={rightIconButton}
                leftCheckbox={selectionMode && <Checkbox checked={multipleSelection.indexOf(item) > -1} onCheck={onCheck}/>}
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
                primaryTextId       : emptyStatePrimary || getMessage(629),
                secondaryTextId     : mode === 'book' ? ( emptyStateSecondary || null ) : null
            };
            if(mode === 'book' && item.actions && item.actions.create){
                emptyStateProps = {
                    ...emptyStateProps,
                    actionLabelId: getMessage(item.actions.create),
                    actionCallback: ()=>model.setCreateItem()
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
            <div style={{flex:1, flexDirection:'column', display:'flex', width:'100%', overflowX: 'hidden', ...style}} onClick={this.props.onClick} className={className}>
                {toolbar}
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
                        searchLabel={searchLabel}
                        onSearch={onSearch}
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