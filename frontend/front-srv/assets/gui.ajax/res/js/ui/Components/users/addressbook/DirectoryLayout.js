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
import ActionsPanel from '../avatar/ActionsPanel'
const {PydioContextConsumer} = Pydio.requireLib('boot');
import PydioApi from 'pydio/http/api';
import Model from './Model'
import TreePanel from './TreePanel'
import CreatesDialog from './CreatesDialog'
import Toolbar from "./Toolbar";
import ListStylesCompact from "./ListStylesCompact";
import {Resizable} from "re-resizable";
import ListStylesMedium from "./ListStylesMedium";

const getCss = (palette) => {
    return `
.folder-avatar::before {
    content: '\\F24B';
    font-family: 'Material Design Icons';
    position: absolute;
    color: rgb(54, 113, 143);
    font-size: 40px;
    top: 11px;
    left: -2px;
}
.compact .folder-avatar::before {
    font-size: 30px;
    top: 5px;
}

.medium .folder-avatar::before {
    font-size: 26px;
    top: 5px;
}

.folder-avatar span.mdi {
    font-size: 20px !important;
    color: #fff !important;
    height: 12.8px !important;
    margin: 7.3px !important;
}
.compact .folder-avatar span.mdi {
    font-size: 13px !important;
}
.medium .folder-avatar span.mdi {
    font-size: 13px !important;
}
.folder-avatar {
    background-color: transparent !important;
}
.medium .folder-avatar {
    left: 18px;
}
`
}

/**
 * High level component to browse users, groups and teams, either in a large format (mode='book') or a more compact
 * format (mode='selector'|'popover').
 * Address book allows to create external users, teams, and also to browse trusted server directories if Federated Sharing
 * is active.
 */
class DirectoryLayout extends React.Component {
    static propTypes = {
        /**
         * Main instance of pydio
         */
        pydio           : PropTypes.instanceOf(Pydio),
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
         * Theme object passed by muiThemeable() wrapper
         */
        muiTheme                    : PropTypes.object,
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

    render() {

        const {mode, getMessage, pydio, style, muiTheme} = this.props;

        const resizeDefaultWidth=256
        const {model, rightPaneSize=resizeDefaultWidth} = this.state;

        const rightPaneItem = model.rightItem()
        const contextItem = model.contextItem()

        const columnStyle = {
            width: '100%',
            height: '100%',
            overflowY:'auto',
            overflowX: 'hidden'
        };

        let topActionsPanel, onEditLabel;

        const searchProps = model.contextIsGroup() ? {
            enableSearch: true,
            searchLabel: getMessage(595, ''),
            onSearch: (v) => model.reloadCurrentWithSearch(v)
        } : {};

        if(model.contextIsTeam() && model.teamsEditable()){
            topActionsPanel =
                (<ActionsPanel
                    {...this.props}
                    team={contextItem}
                    userEditable={true}
                    reloadAction={()=>{model.reloadContext();}}
                    onDeleteAction={() => {
                        if(confirm(getMessage(278))){
                            const parent = contextItem._parent;
                            model.setContext(parent, ()=> {
                                model.deleteItems(parent, [contextItem], true)
                            })
                        }
                    }}
                    style={{backgroundColor: 'transparent', borderTop:0, borderBottom:0}}
                />);
            onEditLabel = (item, newLabel) => {
                PydioApi.getRestClient().getIdmApi().updateTeamLabel(item.IdmRole.Uuid, newLabel, () => {
                    const parent = contextItem._parent;
                    model.setContext(parent, ()=> {
                        model.reloadContext();
                    })
                });
            };
        }

        const {mui3} = muiTheme.palette
        const smallScreen = muiTheme.breakpoint === 'xs' || muiTheme.breakpoint === 's'
        const main = muiTheme.darkMode?'surface':'surface-variant'
        const variant = muiTheme.darkMode?'surface-variant':'surface'

        return (
            <div style={{display:'flex', height: '100%', overflow:'hidden', flexDirection:'column', background:mui3[main], ...style}}>
                <div style={{height:72, display:'flex', flexShrink:0 ,alignItems:'center'}}>
                    <Toolbar
                        pydio={pydio}
                        model={model}
                        mode={'book'}
                        getMessage={getMessage}
                        actionsPanel={topActionsPanel}
                        onEditLabel={onEditLabel}
                        style={{width:'100%'}}
                        {...searchProps}
                    />
                </div>
                <div style={{display:'flex', flex: 1, overflow:'hidden', margin:12, marginTop: 0}}>
                    {!smallScreen &&
                        <Resizable defaultSize={{width:resizeDefaultWidth}} enable={{right:true}} style={{margin:0}}>
                            <TreePanel
                                pydio={pydio}
                                model={model}
                                listStyles={{}}
                                muiTheme={muiTheme}
                                style={{...columnStyle, paddingRight: 8, color:mui3["on-surface-variant"]}}
                            />
                        </Resizable>
                    }
                    <UsersList
                        pydio={pydio}
                        model={model}
                        item={contextItem}
                        mode={'book'}
                        showAllParents={smallScreen}

                        onItemClicked={(i) => model.leafItemClicked(i)}
                        onFolderClicked={(i,c) => model.setContext(i,c)}
                        onClick={()=> model.clearRightItem()}

                        loading={model.loading}
                        actionsForCell={this.props.actionsForCell}
                        usersOnly={this.props.usersOnly}
                        listStyles={ListStylesMedium}
                        style={{borderRadius: muiTheme.borderRadius, backgroundColor:mui3[variant]}}
                        {...searchProps}
                    />

                    <Resizable
                        size={{width:rightPaneItem?rightPaneSize:0}}
                        onResizeStop={(e,dir,el,delta)=>{this.setState({rightPaneSize:rightPaneSize+delta.width})}}
                        enable={{left:!!rightPaneItem}}
                        style={{marginLeft:!!rightPaneItem?12:0, transition:'width 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'}}
                    >
                        <RightPanelCard
                            pydio={pydio}
                            model={model}
                            zDepth={0}
                            style={{...columnStyle, background:mui3[variant], borderRadius:muiTheme.borderRadius}}
                        />
                    </Resizable>
                </div>
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

DirectoryLayout = PydioContextConsumer(DirectoryLayout);
DirectoryLayout = muiThemeable()(DirectoryLayout);
export {DirectoryLayout as default}
