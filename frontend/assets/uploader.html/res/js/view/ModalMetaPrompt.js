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

import React,{useCallback, useState, useRef} from 'react'
import Pydio from 'pydio'
import Node from 'pydio/model/node'
import {Dialog, FlatButton} from 'material-ui'

export default ({onDismiss, metaLib}) => {

    const [data, setData] = useState({})
    const pydio = Pydio.getInstance();
    const cancel = useCallback(()=> {
        onDismiss()
    }, [])
    const submit = useCallback(()=> {
        onDismiss(data)
    }, [data])


    const {UserMetaPanel} = metaLib
    const metaPanel = useRef(null)

    return (
        <Dialog
            title={"Set Metadata"}
            actions={[
                <FlatButton label={pydio.MessageHash[54]} onClick={cancel}/>,
                <FlatButton label={pydio.MessageHash[48]} onClick={submit} primary={true}/>
            ]}
            modal={true}
            open={true}
            bodyStyle={{paddingBottom: 0}}
            contentStyle={{width: 420, maxWidth:'100%', background: 'var(--md-sys-color-surface-3)', borderRadius:20}}
        >
            <div>
                <UserMetaPanel
                    pydio={pydio}
                    ref={metaPanel}
                    multiple={false}
                    node={new Node()}
                    editMode={true}
                    style={{fontSize: 14, minHeight:200}}
                    onChangeUpdateData={(d) => setData(d)}
                />
            </div>
        </Dialog>
    );

}
