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

import React, {useRef, useEffect} from 'react'
import Pydio from 'pydio'
import PathUtils from 'pydio/util/path'
const {moment} = Pydio.requireLib('boot');

import {DragDropListEntry} from './ListEntry'
import {withNodeListenerEntry} from './withNodeListenerEntry'


/**
 * Specific list entry rendered as a table row. Not a real table, CSS used.
 */
const TableListEntry = (props) => {

    const {node, renderActions, tableKeys} = props;

    const renameRef = useRef(null)
    useEffect(()=>{
        const {setInlineEditionAnchor} = props;
        if(setInlineEditionAnchor && renameRef.current) {
            setInlineEditionAnchor(renameRef.current, {marginLeft: 44})
        }
    }, [node, tableKeys])

    let actions = props.actions;
    if(renderActions) {
        actions = renderActions(node);
    }

    let cells = [];
    let firstKey = true;
    const meta = node.getMetadata();
    Object.keys(tableKeys).forEach((key) => {
        let data = tableKeys[key];
        let style = data['width']?{width:data['width']}:null;
        let value, rawValue;
        if(data.renderCell) {
            data['name'] = key;
            value = data.renderCell(node, data);
        }else if(key === 'ajxp_modiftime') {
            let mDate = moment(parseFloat(meta.get('ajxp_modiftime')) * 1000);
            let dateString = mDate.calendar();
            if (dateString.indexOf('/') > -1) {
                dateString = mDate.fromNow();
            }
            value = dateString;
        } else if(key === 'bytesize'){
            if(parseInt(meta.get(key))){
                value = PathUtils.roundFileSize(parseInt(meta.get(key)));
            } else{
                value = "-"
            }
        }else{
            value = meta.get(key);
        }
        rawValue = meta.get(key);
        let ref = null;
        if(firstKey){
            ref = renameRef
        }
        cells.push(<span key={key} className={'cell cell-' + key} title={rawValue} style={style} data-label={data['label']} ref={ref}>{value}</span>);
        firstKey = false;
    });

    return (
        <DragDropListEntry
            {...props}
            iconCell={null}
            firstLine={cells}
            actions={actions}
        />
    );
        
}

export default withNodeListenerEntry(TableListEntry);

