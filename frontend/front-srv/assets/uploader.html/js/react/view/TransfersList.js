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

class TransfersList extends React.Component{

    componentDidMount(){
        let store = UploaderModel.Store.getInstance();
        this._storeObserver = function(){
            this.setState({items: store.getItems()});
        }.bind(this);
        store.observe("update", this._storeObserver);
        store.observe("auto_close", function(){
            if(this.props.onDismiss){
                this.props.onDismiss();
            }
        }.bind(this));
        this.setState({items: store.getItems()});
    }

    componentWillReceiveProps(nextProps) {

        const {autoStart} = nextProps;
        const {items} = this.state;

        if (autoStart && items["pending"].length) {
            UploaderModel.Store.getInstance().processNext();
        }
    }

    componentWillUnmount(){
        if(this._storeObserver){
            UploaderModel.Store.getInstance().stopObserving("update", this._storeObserver);
            UploaderModel.Store.getInstance().stopObserving("auto_close");
        }
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

    render(){
        let items = [];
        if(this.state && this.state.items){
            this.renderSection(items, this.state.items.processing, Pydio.getInstance().MessageHash['html_uploader.14'], 'section-processing');
            this.renderSection(items, this.state.items.pending, Pydio.getInstance().MessageHash['html_uploader.15'], 'section-pending');
            this.renderSection(items, this.state.items.errors, Pydio.getInstance().MessageHash['html_uploader.23'], 'section-errors');
            this.renderSection(items, this.state.items.processed, Pydio.getInstance().MessageHash['html_uploader.16'], 'section-processed');
        }
        return (
            <div id="upload_files_list" style={{height: '100%'}} className={UploaderModel.Configs.getInstance().getOptionAsBool('UPLOAD_SHOW_PROCESSED', 'upload_show_processed', false) ? 'show-processed' : ''}>
                {items}
            </div>
        )
    }
}

export {TransfersList as default}