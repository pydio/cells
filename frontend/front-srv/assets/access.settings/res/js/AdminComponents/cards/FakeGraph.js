/*
 * Copyright 2007-2022 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio Cells.
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

import React, {Component} from 'react'
import Pydio from 'pydio'
const {asGridItem} = Pydio.requireLib('components');
const {PydioContextConsumer, moment} = Pydio.requireLib('boot');
import AdminStyles from "../styles/AdminStyles";
import {Paper} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'

class FakeGraph extends Component {

    constructor(props) {
        super(props);
        this.state = {hover: false}
    }

    render() {
        const {hover} = this.state;
        const {muiTheme, type, pydio} = this.props;
        const adminStyles = AdminStyles(muiTheme.palette)
        const subHeaderStyle = adminStyles.body.block.headerFull;
        const style  = {...this.props.style}
        const overlay = {
            position:'absolute',
            top: 0, bottom: 0, right: 0, left: 0,
            backgroundColor: hover? 'rgba(0,0,0,.5)':'rgba(0,0,0,.25)',
            cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'background 350ms'
        }
        const overlayContent = {
            color:'white',
            fontSize: hover? 18 : 15,
            textAlign:hover?'left':'center',
            fontWeight: 500,
            width: '60%',
            lineHeight:'1.6em',
            transition:'font-size 350ms'
        }
        const filter =  hover ? 'blur(2px)' : 'blur(1px)'
        const message = (id) => {return pydio.MessageHash['admin_dashboard.' + id]};
        let contents;
        if(type === 'files') {
            contents = [
                <li>+ {message('ent.advanced')}</li>,
                <li>+ {message('ent.features.legend')}</li>
            ]
        } else {
            contents = [
                <li>+ {message('ent.support')}: {message('ent.support.legend')}</li>,
                <li>+ {message('ent.upgrade.legend')}</li>
            ]
        }

        return(
            <Paper
                {...this.props}
                {...adminStyles.body.block.props}
                style={{...adminStyles.body.block.container, margin:0,...style}}
                transitionEnabled={false}
            >
                <div style={{...subHeaderStyle, filter}}>{message('graph.' + type)}</div>
                <img alt={''} src={'plug/access.settings/res/images/graph-'+type+'.png'} style={{filter}}/>
                <div
                    style={overlay}
                    onClick={()=>{window.open('https://pydio.com/en/pydio-cells/overview?utm_source=settings')}}
                    onMouseEnter={() => this.setState({hover: true})}
                    onMouseLeave={() => this.setState({hover: false})}
                >
                    <div style={overlayContent}>{message('ent.title')}
                        <div style={{fontSize: 15, lineHeight:'1.6em', textAlign:'left', height:hover?120:0, transition:'all 350ms', overflow:'hidden'}}><ul>{contents}</ul></div>
                    </div>
                </div>
            </Paper>
        )
    }
}


FakeGraph = PydioContextConsumer(FakeGraph);
FakeGraph = muiThemeable()(FakeGraph);
FakeGraph = asGridItem(
    FakeGraph,
    Pydio.getMessages()['advanced_settings.home.32'],
    {gridWidth:4,gridHeight:20},
    []
);

FakeGraph.displayName = 'FakeGraph';
export default FakeGraph