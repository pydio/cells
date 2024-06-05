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

const {Component} = require('react')
const {findDOMNode} = require('react-dom')

export default function(PydioComponent, onDropFunction){

    let DND, Backend;
    try{
        DND = require('react-dnd');
        Backend = require('react-dnd-html5-backend');
    }catch(e){
        return PydioComponent;
    }


    class NativeFileDropProvider extends Component{

        render(){
            const {connectDropTarget} = this.props;
            return (
                <PydioComponent
                    {...this.props}
                    ref={(instance) => {
                        connectDropTarget(findDOMNode(instance))
                    }}
                />
            );
        }

    }

    const fileTarget = {

        drop: function (props, monitor) {

            if(!monitor.isOver({shallow: true})){
                return
            }

            let dataTransfer = monitor.getItem().dataTransfer;
            let items;
            if (dataTransfer.items && dataTransfer.items.length && dataTransfer.items[0] && (dataTransfer.items[0].getAsEntry || dataTransfer.items[0].webkitGetAsEntry)) {
                items = dataTransfer.items;
            }
            onDropFunction(items, dataTransfer.files, props);

        }
    };

    NativeFileDropProvider = DND.DropTarget(Backend.NativeTypes.FILE, fileTarget, function (connect, monitor) {
        return {
            connectDropTarget   : connect.dropTarget(),
            canDrop             : monitor.canDrop(),
            isOver              : monitor.isOver(),
            isOverCurrent       : monitor.isOver({shallow:true})
        };
    })(NativeFileDropProvider);

    return NativeFileDropProvider;

}


