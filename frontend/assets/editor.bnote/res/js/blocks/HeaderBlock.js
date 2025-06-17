/*
 * Copyright 2025 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import {useContext} from 'react'
import Pydio from 'pydio'
import {SaveContext} from "../MainPanel";
import {MdSave} from "react-icons/md";
import {PydioContext} from "../hooks/context";

const { moment } = Pydio.requireLib('boot');
const {ButtonMenu} = Pydio.requireLib('components');
const LangUtils = require('pydio/util/lang')

export const HeaderBlock = (props) => {
    const {dataModel} = useContext(PydioContext)
    const {dirty} = useContext(SaveContext)
    const node = dataModel.getContextNode();
    const date = moment(new Date(parseInt(node.getMetadata().get('ajxp_modiftime'))*1000)).fromNow()
    let description
    const activeRepo = Pydio.getInstance().user.getActiveRepositoryObject()
    if(node.getMetadata().has('ws_root')) {
        description = activeRepo.getDescription() || '';
    }
    const pydio = Pydio.getInstance()
    const newButtonProps = {
        buttonStyle:{height: 30, lineHeight: '26px', marginLeft: 6},
        buttonLabelStyle:{fontSize: 20, paddingLeft: 6, paddingRight: 6}
    };

    let segments = [];
    if(node.getPath().replace('/', '') !== '') {
        segments.push(<span className={"segment first"} style={{cursor:'pointer'}} onClick={() => pydio.goTo('/')}>{activeRepo.getLabel()}</span>)
    }
    let rebuilt = '';
    // Remove last part
    const parts = LangUtils.trimLeft(node.getPath(), '/').split('/')
    parts.pop()
    parts.forEach((seg, i) => {
        if(!seg) {
            return;
        }
        const last = (i===parts.length-1)
        rebuilt += '/' + seg;
        const rebuiltCopy = rebuilt;
        segments.push(<span key={'bread_sep_' + i} className="separator"> / </span>);
        segments.push(<span key={'bread_' + i} style={{cursor:'pointer'}} className={"segment"+(last?' last':'')} onClick={(e)=> {e.stopPropagation(); console.log(rebuiltCopy); pydio.goTo(rebuiltCopy)}}>{seg}</span>);
    });

    return (
        <div style={{paddingBottom: 20}}>
            {segments && <div style={{fontSize: '0.8em'}}>{segments}</div>}
            <h1 style={{fontSize:'2em', fontWeight:700, display:'flex', alignItems:'baseline'}}>
                {/*Rich text field for user to type in*/}
                <div className={"inline-content"} style={{flexGrow:'initial', width:'auto'}} ref={props.contentRef} />
                <ButtonMenu
                    pydio={pydio}
                    {...newButtonProps}
                    id="create-button-menu-inline"
                    toolbars={["upload", "create"]}
                    buttonTitle={"+"}
                    controller={pydio.Controller}
                />
                {dirty && <span style={{fontSize:16, fontWeight:'normal', opacity: 0.3}}><MdSave/></span>}
            </h1>
            <div style={{color:'gray'}}>{description?description+' - ':null}Created {date}</div>
        </div>

    );

}

