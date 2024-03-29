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

import React, {useState, useEffect} from 'react'
import Pydio from 'pydio'
import InfoPanelCard from './InfoPanelCard'
import PathUtils from 'pydio/util/path'
const {PydioContextConsumer} = Pydio.requireLib('boot')

let FileInfoCard = ({node, getMessage, ...otherProps}) => {

    const [meta, setMeta] = useState(new Map())
    useEffect(() => {
        if(!node){
            return () => {}
        }
        setMeta(node.getMetadata())
        const observer = () => {
            setMeta(node.getMetadata())
        }
        node.observe('node_replaced', observer)
        return () => {
            node.stopObserving('node_replaced', observer)
        }
    }, [node])

    let size = meta.get('bytesize');
    let hSize = PathUtils.roundFileSize(parseInt(size));
    const unit = Pydio.getMessages()['byte_unit_symbol'] || 'B';
    const date = new Date();
    date.setTime(parseInt(meta.get('ajxp_modiftime')) * 1000);
    let formattedDate = PathUtils.formatModifDate(date);

    let data = [
        {key:'size',label:getMessage('2'),value:hSize, hoverValue: size + ' ' + unit},
        {key:'date',label:getMessage('4'),value:formattedDate}
    ];

    let w = meta.get('image_width');
    let h = meta.get('image_height');
    if(w && h){
        data = [
            ...data,
            {key:'image', label:getMessage('135'), value:w + 'px X ' + h + 'px'}
        ]
    }

    if(meta.has('x-cells-hash')) {
        data.push({key:'x-cells-hash', label:'Internal Hash', value:meta.get('x-cells-hash')})
    }

    if(meta.has('uuid')) {
        data.push({key:'uuid', label:'Unique Identifier', value:meta.get('uuid')})
    }

    if(meta.has('mime')) {
        data.push({key:'mime', label:'Mime Type', value:meta.get('mime')})
    }

    if(meta.has('etag')) {
        data.push({key:'etag', label:'Storage ETag', value:meta.get('etag')})
    }


    return (
        <InfoPanelCard
            node={node}
            getMessage={getMessage}
            {...otherProps}
            identifier={"file-info"}
            title={getMessage('341')}
            standardData={data}
            contentStyle={{paddingBottom: 10}}
            icon="mdi mdi-information-outline"
            iconColor="#2196f3"
        />
    );
}

FileInfoCard = PydioContextConsumer(FileInfoCard);
export {FileInfoCard as default}
