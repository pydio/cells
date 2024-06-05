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
import UsersList from './UsersList'
import RightPanelCard from './RightPanelCard'
import PropTypes from 'prop-types';
import Pydio from 'pydio'
import {muiThemeable} from 'material-ui/styles'
const {PydioContextConsumer, PydioContextProvider} = Pydio.requireLib('boot');
const {ThemedContainers:{Popover, IconButton}} = Pydio.requireLib('hoc')
import Model from './Model'
import CollectionsPanel from "./CollectionsPanel";
import CreatesDialog from './CreatesDialog'
import Toolbar from "./Toolbar";
import {getCss} from './DirectoryLayout'

/**
 * High level component to browse users, groups and teams, either in a large format (mode='book') or a more compact
 * format (mode='selector'|'popover').
 * Address book allows to create external users, teams, and also to browse trusted server directories if Federated Sharing
 * is active.
 */
class AddressBook extends React.Component {
    static propTypes = {
        /**
         * Main instance of pydio
         */
        pydio           : PropTypes.instanceOf(Pydio),
        /**
         * Display mode, either large (book) or small picker ('selector', 'popover').
         */
        mode            : PropTypes.oneOf(['book', 'selector', 'popover']).isRequired,
        /**
         * Use book mode but display as column
         */
        bookColumn      : PropTypes.bool,
        /**
         * Callback triggered in 'selector' mode whenever an item is clicked.
         */
        onItemSelected  : PropTypes.func,
        /**
         * Display users only, no teams or groups
         */
        usersOnly       : PropTypes.bool,
        /**
         * Choose various user sources, either the local directory or remote ( = trusted ) servers.
         */
        usersFrom       : PropTypes.oneOf(['local', 'remote', 'any']),
        /**
         * Disable the search engine
         */
        disableSearch   : PropTypes.bool,
        /**
         * Theme object passed by muiThemeable() wrapper
         */
        muiTheme                    : PropTypes.object,
        /**
         * Will be passed to the Popover object
         */
        popoverStyle                : PropTypes.object,
        /**
         * Used as a button to open the selector in a popover
         */
        popoverButton               : PropTypes.object,
        /**
         * Will be passed to the Popover container object
         */
        popoverContainerStyle       : PropTypes.object,
        /**
         * Will be passed to the Popover Icon Button.
         */
        popoverIconButtonStyle      : PropTypes.object
    };

    static defaultProps = {
        mode            : 'book',
        usersOnly       : false,
        usersFrom       : 'any',
        teamsOnly       : false,
        disableSearch   : false,
    };

    constructor(props) {
        super(props);

        const {pydio, mode, usersOnly, usersFrom, teamsOnly, onItemSelected} = props;

        const model = new Model(pydio, mode, usersOnly, usersFrom, teamsOnly, onItemSelected)
        model.initTree();
        model.observe('update', () => {
            this.forceUpdate();
        })
        this.state = {model}

    }

    componentDidMount() {
        const {model} = this.state;
        model.reloadContext();
    }

    openPopover = (event) => {
        this.setState({
            popoverOpen: true,
            popoverAnchor: event.currentTarget
        });
    };

    closePopover = () => {
        this.setState({popoverOpen: false});
    };

    render() {

        const {mode, getMessage, bookColumn, listStyles, pydio} = this.props;

        if(mode === 'popover'){

            let iconButton = (
                <IconButton
                    style={{position:'absolute', padding:15, zIndex:100, right:0, bottom: 0, display:this.state.loading?'none':'initial'}}
                    iconStyle={{fontSize:19}}
                    iconClassName={'mdi mdi-book-open-variant'}
                    onClick={this.openPopover}
                />
            );
            const WrappedAddressBook = PydioContextProvider(AddressBook, pydio, pydio.UI.themeBuilder);
            return (
                <span>
                    {iconButton}
                    <Popover
                        open={this.state.popoverOpen}
                        anchorEl={this.state.popoverAnchor}
                        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                        targetOrigin={{horizontal: 'left', vertical: 'top'}}
                        onRequestClose={this.closePopover}
                        style={{marginLeft: 20}}
                        zDepth={2}
                    >
                        <div style={{width: 320, height: 420}}>
                            <WrappedAddressBook {...this.props} mode="selector" style={{height:420}} />
                        </div>
                    </Popover>
                </span>

            );

        }

        const {model} = this.state;

        const rightPaneItem = model.rightItem()
        const contextItem = model.contextItem()

        const leftColumnStyle = {
            width: 256,
            overflowY:'auto',
            overflowX: 'hidden'
        };
        let centerComponent, rightPanel;
        const {muiTheme} = this.props;
        const {mui3 = {}} = muiTheme.palette

        let emptyStatePrimary;
        let emptyStateSecondary;
        let searchProps = {};
        if(!this.props.disableSearch && model.contextIsGroup()){
            searchProps = {
                enableSearch: true,
                searchLabel: getMessage(595, ''),
                onSearch: (v) => model.reloadCurrentWithSearch(v)
            };
        }

        let toolbar
        if(mode !== 'inner') {
            toolbar = (
                <Toolbar
                    pydio={pydio}
                    model={model}
                    mode={mode}
                    bookColumn={bookColumn}
                    getMessage={getMessage}
                    {...searchProps}
                />
            )
        }


        centerComponent = (
            <UsersList
                model={model}
                item={contextItem}

                mode={mode}
                bookColumn={bookColumn}
                toolbar={toolbar}

                onItemClicked={(i) => model.leafItemClicked(i)}
                onFolderClicked={(i,c) => model.setContext(i,c)}
                onClick={()=> model.clearRightItem()}

                loading={model.loading}
                emptyStatePrimaryText={emptyStatePrimary}
                emptyStateSecondaryText={emptyStateSecondary}
                actionsForCell={this.props.actionsForCell}
                usersOnly={this.props.usersOnly}
                listStyles={listStyles}
                {...searchProps}
            />);


        rightPanel = (
            <RightPanelCard
                pydio={this.props.pydio}
                model={model}
                style={{
                    ...leftColumnStyle,
                    position: 'absolute',
                    transformOrigin:'right',
                    background: mui3['surface-3'],
                    width: mode === 'book'? 320 : 280,
                    right: 10,
                    bottom: 10,
                    top: 120,
                    zIndex: 2,
                    transform: rightPaneItem?null:'scale(0)',
                }}
            />
        );

        let style = this.props.style || {};
        const left = {
            background: mui3['surface-3'],
            color: mui3['on-surface-variant'],
            borderRight: '1px solid #e0e0e0'
        }

        return (
            <div style={{display:'flex', height: mode === 'selector' ? 320 : 450 , ...style}}>
                {mode === 'book' &&
                    <CollectionsPanel
                        model={model}
                        listStyles={listStyles}
                        rootStyle={{...leftColumnStyle, ...left, zIndex:2}}
                    />
                }
                {centerComponent}
                {rightPanel}
                <CreatesDialog
                    pydio={pydio}
                    model={model}
                    onCancel={() => {model.clearCreateItem()}}
                    afterSubmit={() => {model.clearCreateItem(); model.reloadContext()}}
                />
                <style type={"text/css"} dangerouslySetInnerHTML={{__html:getCss(this.props.muiTheme.palette)}}/>
            </div>
        );
    }
}

AddressBook = PydioContextConsumer(AddressBook);
AddressBook = muiThemeable()(AddressBook);
export {AddressBook as default}
