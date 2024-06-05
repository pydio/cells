/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
const {FileDropZone} = Pydio.requireLib('form')
import {Paper, FontIcon, IconButton} from 'material-ui'
import Tooltip from '@mui/material/Tooltip'
import './big-buttons.less'

const styles = {
    root:{
        paddingTop: 20
    },
    section:{
        container:{},
        title:{},
        description:{},
        actions:{}
    },
    action:{
        container:{},
        icon:{},
        title:{},
        description:{}
    },
    deleteButton:{

    },
    deleteIconProps:{
        style:{
            position:'absolute',
            top: 0,
            right:0,
        },
        iconStyle:{
            color:'#bdbdbd',
            hoverColor:'#9e9e9e'
        }
    }
};

class PanelBigButtons extends React.Component {

    constructor(props){
        if (!props.model) {
            props.model = {Sections: []};
        }
        super(props);
    }

    stProps(a, b, additionalClass='') {
        return {
            style:styles[a][b],
            className:'stepper-'+a+'-'+b + (additionalClass?' '+additionalClass:'')
        }
    }

    render() {

        const {model, style, onPick} = this.props;

        return (
            <div style={{...styles.root, ...style}} className={"bbpanel"}>
                {model.Sections.map((ss) => {
                    return (
                        <div {...this.stProps('section', 'container')}>
                            <div {...this.stProps('section', 'title')}>{ss.title}</div>
                            <div {...this.stProps('section', 'description')}>{ss.description}</div>
                            <div {...this.stProps('section', 'actions')}>{ss.Actions.map(a => {
                                const tipContent = (
                                    <div style={{fontSize: 12, fontWeight: 400, padding:10, maxWidth: 200, lineHeight: '16px'}}>
                                        <div style={{fontWeight: 500, paddingBottom: 5}}>{a.title}</div>
                                        <div>{a.description}</div>
                                    </div>
                                )
                                const children = (
                                    <React.Fragment>
                                        {a.tag && <div className={"stepper-tag"}>{a.tag}</div>}
                                        {a.onDelete &&
                                            <div {...this.stProps('action', 'deleteButton')}>
                                                <IconButton
                                                    iconClassName={"mdi mdi-close"}
                                                    tooltip={"Remove"}
                                                    onClick={(e) => {e.stopPropagation();a.onDelete();}}
                                                    {...styles.deleteIconProps}
                                                />
                                            </div>
                                        }
                                            <div  {...this.stProps('action', 'icon')}><FontIcon color={a.tint||'#03A9F4'} className={a.icon}/></div>
                                            <div  {...this.stProps('action', 'title')} title={a.title}>{a.title}</div>
                                        <Tooltip placement={"bottom"} arrow title={tipContent}><div {...this.stProps('action', 'description')}>{a.description}</div></Tooltip>
                                    </React.Fragment>
                                )
                                if(a.dropProps) {
                                    return (
                                        <FileDropZone {...this.stProps('action', 'container', 'drop-force')} {...a.dropProps}>{children}</FileDropZone>
                                    )
                                } else {
                                    return (
                                        <Paper zDepth={0} {...this.stProps('action', 'container', a.tag)} onClick={()=>{onPick(a.value)}}>{children}</Paper>
                                    );

                                }
                            })}</div>
                        </div>
                    )
                })}
            </div>
        );

    }

}

export default PanelBigButtons