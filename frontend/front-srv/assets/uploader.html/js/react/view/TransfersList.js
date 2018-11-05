/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Pydio from 'pydio'
import TransferFolder from './TransferFolder'
import TransferFile from './TransferFile'
import LangUtils from 'pydio/util/lang'
import {CircularProgress} from'material-ui'

class TransfersList extends React.Component{

    constructor(props){
        super(props);
        this.state = {showAll: false};
    }

    sortItems(items){
        items.sort(function(a, b){
            let aType = a instanceof UploaderModel.FolderItem? 'folder' : 'file';
            let bType = b instanceof UploaderModel.FolderItem? 'folder' : 'file';
            if(aType === bType){
                if(a.getFullPath() === b.getFullPath()) return 0;
                else return a.getFullPath() > b.getFullPath() ? 1 : -1;
            }else{
                return aType === 'folder' ? -1 : 1;
            }
        });
    }


    renderSection(accumulator, items, title = "", className=""){
        const {showAll} = this.state;
        if(title && items.length){
            accumulator.push(<div className={className + " header"}>{title}</div>);
        }
        items.sort(function(a, b){
            let aType = a instanceof UploaderModel.FolderItem? 'folder' : 'file';
            let bType = b instanceof UploaderModel.FolderItem? 'folder' : 'file';
            if(aType === bType){
                return 0;
            }else{
                return aType === 'folder' ? -1 : 1;
            }
        });
        const limit = 50;
        const sliced = showAll ? items : items.slice(0, limit);
        sliced.forEach(function(f){
            if(f instanceof UploaderModel.FolderItem){
                accumulator.push( <TransferFolder key={f.getId()} item={f} className={className}/> );
            }else{
                accumulator.push( <TransferFile key={f.getId()} item={f} className={className}/> );
            }
        });
        if (!showAll && items.length > limit) {
            accumulator.push(<div style={{cursor:'pointer'}} className={className} onClick={()=>{this.setState({showAll: true})}}>And {items.length - limit} more ...</div>)
        }
    }

    renderSessionSection(accumulator, sessions, title = "", className=""){
        if(sessions && sessions.length){
            accumulator.push(<div className={className + " header"}>{title}</div>);
            sessions.forEach((session, i) => {
                accumulator.push(<div key={"session-"+i} style={{display:'flex',alignItems:'center'}}>
                    <span className={"mdi mdi-timer-sand"} style={{margin:'0 6px'}}/>
                    <span style={{flex:1}}>{session.sessionStatus()}</span>
                </div>);
            });
        }
    }

    treeView(merged){
        const tree = [];
        Object.keys(merged).forEach((path)  => {

            const pathParts = path.split('/');
            pathParts.shift(); // Remove first blank element from the parts array.
            let currentLevel = tree; // initialize currentLevel to root
            pathParts.forEach((part) => {
                // check to see if the path already exists.
                const existingPath = currentLevel.find((data)=>{return data.name === part});
                if (existingPath) {
                    // The path to this item was already in the tree, so don't add it again.
                    // Set the current level to this path's children
                    currentLevel = existingPath.children;
                } else {
                    const newPart = {
                        name: part,
                        item: merged[path],
                        children: [],
                    };
                    currentLevel.push(newPart);
                    currentLevel = newPart.children;
                }
            });
        });
        return tree
    }

    render(){
        let components = [];
        const {items} = this.props;
        const {showAll} = this.state;
        if(items){

            this.renderSessionSection(components, items.sessions, 'Processing files', 'section-processing');
            /*
            this.renderSection(components, items.processing, Pydio.getInstance().MessageHash['html_uploader.14'], 'section-processing');
            this.renderSection(components, items.pending, Pydio.getInstance().MessageHash['html_uploader.15'], 'section-pending');
            this.renderSection(components, items.errors, Pydio.getInstance().MessageHash['html_uploader.23'], 'section-errors');
            this.renderSection(components, items.processed, Pydio.getInstance().MessageHash['html_uploader.16'], 'section-processed');
            */

            const merged = {};
            const all = [...items.processing, ...items.pending, ...items.errors, ...items.processed];
            this.sortItems(all);
            all.forEach(item => { merged[item.getFullPath()] = item; });

            const tree = this.treeView(merged);
            console.log(tree);

            if(tree.length){
                components.push(<TransferFolder children={tree} style={{paddingLeft: 0, marginLeft: -20}} showAll={false} limit={10}/>)
            }
        }

        const container = {
            height: '100%',
            overflowY: 'auto',
            margin: '0 -10px',
            backgroundColor: '#FAFAFA',
            padding: 16
        };

        return (
            <div style={container} className={UploaderModel.Configs.getInstance().getOptionAsBool('UPLOAD_SHOW_PROCESSED', 'upload_show_processed', false) ? 'show-processed' : ''}>
                {components}
            </div>
        )
    }
}

export {TransfersList as default}